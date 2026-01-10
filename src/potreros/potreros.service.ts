import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { parseBigInt } from '../common/utils/parse-bigint';
import { parsePagination, parsePaginationFromDto, paginatedResponse } from '../common/utils/pagination.util';
import { CreatePotreroDto } from './dto/create-potrero.dto';
import { QueryPotreroDto } from './dto/query-potrero.dto';
import { UpdatePotreroDto } from './dto/update-potrero.dto';

@Injectable()
export class PotrerosService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(empresaId: bigint, query: QueryPotreroDto) {
        const pagination = parsePaginationFromDto(query);

        const where: Record<string, unknown> = { empresa_id: empresaId };

        if (query.id_finca) {
            where.id_finca = parseBigInt(query.id_finca, 'id_finca');
        }
        if (query.q) {
            where.nombre = { contains: query.q };
        }

        const [data, total] = await Promise.all([
            this.prisma.potreros.findMany({
                where,
                skip: pagination.skip,
                take: pagination.take,
                orderBy: { nombre: 'asc' },
                include: {
                    fincas: { select: { nombre: true } },
                    tipos_potrero: { select: { nombre: true } },
                    estados_potreros: { select: { nombre: true, codigo: true } },
                },
            }),
            this.prisma.potreros.count({ where }),
        ]);

        const mapped = data.map((p) => this.mapPotrero(p));
        return paginatedResponse(mapped, total, pagination);
    }

    async findOne(empresaId: bigint, id: bigint) {
        const potrero = await this.prisma.potreros.findFirst({
            where: { id_potrero: id, empresa_id: empresaId },
            include: {
                fincas: { select: { nombre: true } },
                tipos_potrero: { select: { nombre: true } },
                estados_potreros: { select: { nombre: true, codigo: true } },
            },
        });

        if (!potrero) {
            throw new NotFoundException('Potrero no encontrado');
        }

        return this.mapPotrero(potrero);
    }

    async create(empresaId: bigint, dto: CreatePotreroDto) {
        const id_finca = parseBigInt(dto.id_finca, 'id_finca');

        const finca = await this.prisma.fincas.findFirst({
            where: { id_finca, empresa_id: empresaId },
        });
        if (!finca) {
            throw new NotFoundException('Finca no encontrada');
        }

        const data: Record<string, unknown> = {
            empresa_id: empresaId,
            id_finca,
            nombre: dto.nombre,
            notas: dto.notas ?? null,
        };

        if (dto.area_hectareas) {
            data.area_hectareas = parseFloat(dto.area_hectareas);
        }
        if (dto.area_m2) {
            data.area_m2 = parseFloat(dto.area_m2);
        }
        if (dto.geometry && Array.isArray(dto.geometry) && dto.geometry.length > 0) {
            data.geometry = dto.geometry;
        }
        if (dto.id_tipo_potrero) {
            data.id_tipo_potrero = parseBigInt(dto.id_tipo_potrero, 'id_tipo_potrero');
        }
        // El frontend envía estado como string, buscar por codigo o nombre y resolver a id_estado_potrero
        // estados_potreros es un catálogo global (sin empresa_id)
        if (dto.estado) {
            const estadoPotrero = await this.prisma.estados_potreros.findFirst({
                where: {
                    OR: [
                        { codigo: dto.estado },
                        { nombre: dto.estado },
                    ],
                    activo: true,
                },
            });
            if (estadoPotrero) {
                data.id_estado_potrero = estadoPotrero.id_estado_potrero;
            }
        }
        if (dto.capacidad_animales) {
            data.capacidad_animales = parseFloat(dto.capacidad_animales);
        }

        const potrero = await this.prisma.potreros.create({
            data: data as Parameters<typeof this.prisma.potreros.create>[0]['data'],
            include: {
                fincas: { select: { nombre: true } },
                tipos_potrero: { select: { nombre: true } },
                estados_potreros: { select: { nombre: true, codigo: true } },
            },
        });

        return this.mapPotrero(potrero);
    }

    async update(empresaId: bigint, id: bigint, dto: UpdatePotreroDto) {
        const existing = await this.prisma.potreros.findFirst({
            where: { id_potrero: id, empresa_id: empresaId },
        });

        if (!existing) {
            throw new NotFoundException('Potrero no encontrado');
        }

        const data: Record<string, unknown> = {};

        if (dto.nombre !== undefined) data.nombre = dto.nombre;
        if (dto.notas !== undefined) data.notas = dto.notas;
        if (dto.area_hectareas !== undefined) {
            data.area_hectareas = dto.area_hectareas ? parseFloat(dto.area_hectareas) : null;
        }
        if (dto.area_m2 !== undefined) {
            data.area_m2 = dto.area_m2 ? parseFloat(dto.area_m2) : null;
        }
        if (dto.geometry !== undefined) {
            data.geometry = dto.geometry && Array.isArray(dto.geometry) && dto.geometry.length > 0 ? dto.geometry : null;
        }
        if (dto.id_tipo_potrero !== undefined) {
            data.id_tipo_potrero = dto.id_tipo_potrero ? parseBigInt(dto.id_tipo_potrero, 'id_tipo_potrero') : null;
        }
        // El frontend envía estado como string, buscar por codigo o nombre y resolver a id_estado_potrero
        // estados_potreros es un catálogo global (sin empresa_id)
        if (dto.estado !== undefined) {
            if (dto.estado) {
                const estadoPotrero = await this.prisma.estados_potreros.findFirst({
                    where: {
                        OR: [
                            { codigo: dto.estado },
                            { nombre: dto.estado },
                        ],
                        activo: true,
                    },
                });
                data.id_estado_potrero = estadoPotrero ? estadoPotrero.id_estado_potrero : null;
            } else {
                data.id_estado_potrero = null;
            }
        }
        if (dto.capacidad_animales !== undefined) {
            data.capacidad_animales = dto.capacidad_animales ? parseFloat(dto.capacidad_animales) : null;
        }

        const potrero = await this.prisma.potreros.update({
            where: { id_potrero_empresa_id: { id_potrero: id, empresa_id: empresaId } },
            data,
            include: {
                fincas: { select: { nombre: true } },
                tipos_potrero: { select: { nombre: true } },
                estados_potreros: { select: { nombre: true, codigo: true } },
            },
        });

        return this.mapPotrero(potrero);
    }

    async remove(empresaId: bigint, id: bigint) {
        const existing = await this.prisma.potreros.findFirst({
            where: { id_potrero: id, empresa_id: empresaId },
        });

        if (!existing) {
            throw new NotFoundException('Potrero no encontrado');
        }

        await this.prisma.potreros.delete({
            where: { id_potrero_empresa_id: { id_potrero: id, empresa_id: empresaId } },
        });

        return { deleted: true };
    }

    async getEstados() {
        const estados = await this.prisma.estados_potreros.findMany({
            where: { activo: true },
            orderBy: { orden: 'asc' },
            select: {
                id_estado_potrero: true,
                codigo: true,
                nombre: true,
                orden: true,
            },
        });

        return estados.map((e) => ({
            id: e.id_estado_potrero.toString(),
            codigo: e.codigo,
            nombre: e.nombre,
            orden: e.orden,
        }));
    }

    private mapPotrero(p: Record<string, unknown>) {
        const potrero = p as {
            id_potrero: bigint;
            empresa_id: bigint;
            id_finca: bigint;
            nombre: string;
            area_hectareas: { toString: () => string } | null;
            area_m2: { toString: () => string } | null;
            geometry: Array<{ lat: number; lng: number }> | null;
            capacidad_animales: { toString: () => string } | null;
            id_tipo_potrero: bigint | null;
            id_estado_potrero: bigint | null;
            notas: string | null;
            fincas?: { nombre: string };
            tipos_potrero?: { nombre: string } | null;
            estados_potreros?: { nombre: string; codigo: string } | null;
        };

        return {
            id: potrero.id_potrero.toString(),
            empresa_id: potrero.empresa_id.toString(),
            id_finca: potrero.id_finca.toString(),
            finca_nombre: potrero.fincas?.nombre ?? null,
            nombre: potrero.nombre,
            area_hectareas: potrero.area_hectareas?.toString() ?? null,
            area_m2: potrero.area_m2?.toString() ?? null,
            geometry: potrero.geometry ?? null,
            capacidad_animales: potrero.capacidad_animales?.toString() ?? null,
            id_tipo_potrero: potrero.id_tipo_potrero?.toString() ?? null,
            tipo_nombre: potrero.tipos_potrero?.nombre ?? null,
            id_estado_potrero: potrero.id_estado_potrero?.toString() ?? null,
            estado: potrero.estados_potreros?.codigo ?? potrero.estados_potreros?.nombre ?? null,
            notas: potrero.notas,
        };
    }
}
