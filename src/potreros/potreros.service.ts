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
        if (dto.id_tipo_potrero) {
            data.id_tipo_potrero = parseBigInt(dto.id_tipo_potrero, 'id_tipo_potrero');
        }

        const potrero = await this.prisma.potreros.create({
            data: data as Parameters<typeof this.prisma.potreros.create>[0]['data'],
            include: {
                fincas: { select: { nombre: true } },
                tipos_potrero: { select: { nombre: true } },
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
        if (dto.id_tipo_potrero !== undefined) {
            data.id_tipo_potrero = dto.id_tipo_potrero ? parseBigInt(dto.id_tipo_potrero, 'id_tipo_potrero') : null;
        }

        const potrero = await this.prisma.potreros.update({
            where: { id_potrero_empresa_id: { id_potrero: id, empresa_id: empresaId } },
            data,
            include: {
                fincas: { select: { nombre: true } },
                tipos_potrero: { select: { nombre: true } },
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

    private mapPotrero(p: Record<string, unknown>) {
        const potrero = p as {
            id_potrero: bigint;
            empresa_id: bigint;
            id_finca: bigint;
            nombre: string;
            area_hectareas: { toString: () => string } | null;
            id_tipo_potrero: bigint | null;
            notas: string | null;
            fincas?: { nombre: string };
            tipos_potrero?: { nombre: string } | null;
        };

        return {
            id: potrero.id_potrero.toString(),
            empresa_id: potrero.empresa_id.toString(),
            id_finca: potrero.id_finca.toString(),
            finca_nombre: potrero.fincas?.nombre ?? null,
            nombre: potrero.nombre,
            area_hectareas: potrero.area_hectareas?.toString() ?? null,
            id_tipo_potrero: potrero.id_tipo_potrero?.toString() ?? null,
            tipo_nombre: potrero.tipos_potrero?.nombre ?? null,
            notas: potrero.notas,
        };
    }
}
