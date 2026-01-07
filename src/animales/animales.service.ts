import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { parseBigInt } from '../common/utils/parse-bigint';
import {
    parsePagination,
    parsePaginationFromDto,
    parseSort,
    paginatedResponse,
} from '../common/utils/pagination.util';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { QueryAnimalDto } from './dto/query-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';

@Injectable()
export class AnimalesService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(empresaId: bigint, query: QueryAnimalDto) {
        const pagination = parsePaginationFromDto(query);
        const sortParams = parseSort(query.sortBy, query.sortDir, [
            'nombre',
            'fecha_nacimiento',
            'sexo',
            'created_at',
        ]);

        const where: Record<string, unknown> = { empresa_id: empresaId };

        if (query.id_finca) {
            where.id_finca = parseBigInt(query.id_finca, 'id_finca');
        }
        if (query.sexo) {
            // Convert friendly values back to database values for filtering
            let sexoValue = query.sexo;
            if (sexoValue === 'macho') sexoValue = 'M';
            if (sexoValue === 'hembra') sexoValue = 'F';
            where.sexo = sexoValue;
        }
        if (query.id_raza) {
            where.id_raza = parseBigInt(query.id_raza, 'id_raza');
        }
        if (query.id_estado) {
            // Check if id_estado is a number (ID) or string (codigo)
            const estadoValue = query.id_estado;
            const isNumeric = /^\d+$/.test(estadoValue);

            if (isNumeric) {
                // Filter by ID
                where.animal_estados_historial = {
                    some: {
                        id_estado_animal: parseBigInt(estadoValue, 'id_estado'),
                        fecha_fin: null, // Only current/active estados
                    }
                };
            } else {
                // Filter by codigo
                where.animal_estados_historial = {
                    some: {
                        estados_animales: {
                            codigo: estadoValue
                        },
                        fecha_fin: null, // Only current/active estados
                    }
                };
            }
        }

        if (query.q) {
            where.nombre = { contains: query.q };
        }

        if (query.solo_activos) {
            // Filter for animals that are currently active
            if (where.animal_estados_historial) {
                // If there's already an estado filter, modify it to include activo
                const existingFilter = where.animal_estados_historial as any;
                existingFilter.some = {
                    ...existingFilter.some,
                    estados_animales: {
                        ...existingFilter.some.estados_animales,
                        codigo: 'activo'
                    },
                    fecha_fin: null
                };
            } else {
                // No existing estado filter, create one for activos
                where.animal_estados_historial = {
                    some: {
                        estados_animales: { codigo: 'activo' },
                        fecha_fin: null
                    }
                };
            }
        }

        const orderBy = sortParams.sortBy
            ? { [sortParams.sortBy]: sortParams.sortDir }
            : { created_at: 'desc' as const };

        const [data, total] = await Promise.all([
            this.prisma.animales.findMany({
                where,
                skip: pagination.skip,
                take: pagination.take,
                orderBy,
                include: {
                    fincas: { select: { nombre: true, id_finca: true } },
                    razas: { select: { nombre: true, id_raza: true } },
                },
            }),
            this.prisma.animales.count({ where }),
        ]);

        const mapped = data.map((animal) => this.mapAnimal(animal));
        return paginatedResponse(mapped, total, pagination);
    }

    async findOne(empresaId: bigint, id: bigint) {
        const animal = await this.prisma.animales.findFirst({
            where: { id_animal: id, empresa_id: empresaId },
            include: {
                fincas: { select: { nombre: true, id_finca: true } },
                razas: { select: { nombre: true, id_raza: true } },
                animales_animales_padre_id_empresa_idToanimales: {
                    select: { id_animal: true, nombre: true },
                },
                animales_animales_madre_id_empresa_idToanimales: {
                    select: { id_animal: true, nombre: true },
                },
            },
        });

        if (!animal) {
            throw new NotFoundException('Animal no encontrado');
        }

        return this.mapAnimal(animal);
    }

    async getProfile(empresaId: bigint, id: bigint) {
        const animal = await this.prisma.animales.findFirst({
            where: { id_animal: id, empresa_id: empresaId },
            include: {
                fincas: { select: { nombre: true, id_finca: true } },
                razas: { select: { nombre: true, id_raza: true } },
                animales_animales_padre_id_empresa_idToanimales: {
                    select: { id_animal: true, nombre: true },
                },
                animales_animales_madre_id_empresa_idToanimales: {
                    select: { id_animal: true, nombre: true },
                },
                animal_identificaciones: {
                    where: { activo: true },
                    include: { tipos_identificacion: true },
                    orderBy: { fecha_asignacion: 'desc' },
                },
                animal_estados_historial: {
                    orderBy: { fecha_inicio: 'desc' },
                    take: 1,
                    include: { estados_animales: true },
                },
                animal_categorias_historial: {
                    orderBy: { fecha_inicio: 'desc' },
                    take: 1,
                    include: { categorias_animales: true },
                },
                eventos_sanitarios: {
                    orderBy: { fecha: 'desc' },
                    take: 5,
                    include: { enfermedades: true },
                },
                eventos_reproductivos_eventos_reproductivos_id_animal_empresa_idToanimales:
                {
                    orderBy: { fecha: 'desc' },
                    take: 5,
                    include: { tipos_evento_reproductivo: true },
                },
                movimientos_animales: {
                    orderBy: { fecha_hora: 'desc' },
                    take: 5,
                    include: {
                        motivos_movimiento: true,
                        potreros_movimientos_animales_potrero_destino_id_empresa_idTopotreros:
                            { select: { nombre: true } },
                        lotes_movimientos_animales_lote_destino_id_empresa_idTolotes: {
                            select: { nombre: true },
                        },
                    },
                },
            },
        });

        if (!animal) {
            throw new NotFoundException('Animal no encontrado');
        }

        const estadoActual = animal.animal_estados_historial[0] ?? null;
        const categoriaActual = animal.animal_categorias_historial[0] ?? null;

        return {
            ...this.mapAnimal(animal),
            estado_actual: estadoActual
                ? {
                    id: estadoActual.estados_animales.id_estado_animal.toString(),
                    codigo: estadoActual.estados_animales.codigo,
                    nombre: estadoActual.estados_animales.nombre,
                    desde: estadoActual.fecha_inicio,
                }
                : null,
            categoria_actual: categoriaActual
                ? {
                    id: categoriaActual.categorias_animales.id_categoria_animal.toString(),
                    codigo: categoriaActual.categorias_animales.codigo,
                    nombre: categoriaActual.categorias_animales.nombre,
                    desde: categoriaActual.fecha_inicio,
                }
                : null,
            identificaciones: animal.animal_identificaciones.map((iden) => ({
                id: iden.id_animal_identificacion.toString(),
                tipo: iden.tipos_identificacion.nombre,
                valor: iden.valor,
                fecha_asignacion: iden.fecha_asignacion,
                activo: iden.activo,
            })),
            eventos_sanitarios_recientes: animal.eventos_sanitarios.map((ev) => ({
                id: ev.id_evento_sanitario.toString(),
                fecha: ev.fecha,
                enfermedad: ev.enfermedades?.nombre ?? null,
                descripcion: ev.descripcion,
            })),
            eventos_reproductivos_recientes:
                animal.eventos_reproductivos_eventos_reproductivos_id_animal_empresa_idToanimales.map(
                    (ev) => ({
                        id: ev.id_evento_reproductivo.toString(),
                        fecha: ev.fecha,
                        tipo: ev.tipos_evento_reproductivo.nombre,
                        detalles: ev.detalles,
                    }),
                ),
            movimientos_recientes: animal.movimientos_animales.map((mov) => ({
                id: mov.id_movimiento.toString(),
                fecha_hora: mov.fecha_hora,
                motivo: mov.motivos_movimiento?.nombre ?? null,
                potrero_destino:
                    mov.potreros_movimientos_animales_potrero_destino_id_empresa_idTopotreros
                        ?.nombre ?? null,
                lote_destino:
                    mov.lotes_movimientos_animales_lote_destino_id_empresa_idTolotes
                        ?.nombre ?? null,
            })),
        };
    }

    async create(empresaId: bigint, dto: CreateAnimalDto) {
        const id_finca = parseBigInt(dto.id_finca, 'id_finca');

        // Verify finca belongs to empresa
        const finca = await this.prisma.fincas.findFirst({
            where: { id_finca, empresa_id: empresaId },
        });
        if (!finca) {
            throw new NotFoundException('Finca no encontrada');
        }

        const data: Record<string, unknown> = {
            empresa_id: empresaId,
            id_finca,
            nombre: dto.nombre ?? null,
            sexo: dto.sexo,
            fecha_nacimiento: dto.fecha_nacimiento
                ? new Date(dto.fecha_nacimiento)
                : null,
            fecha_nacimiento_estimada: dto.fecha_nacimiento_estimada ?? false,
            notas: dto.notas ?? null,
        };

        if (dto.id_raza) {
            data.id_raza = parseBigInt(dto.id_raza, 'id_raza');
        }
        if (dto.padre_id) {
            data.padre_id = parseBigInt(dto.padre_id, 'padre_id');
        }
        if (dto.madre_id) {
            data.madre_id = parseBigInt(dto.madre_id, 'madre_id');
        }

        const animal = await this.prisma.animales.create({
            data: data as Parameters<typeof this.prisma.animales.create>[0]['data'],
            include: {
                fincas: { select: { nombre: true, id_finca: true } },
                razas: { select: { nombre: true, id_raza: true } },
            },
        });

        return this.mapAnimal(animal);
    }

    async update(empresaId: bigint, id: bigint, dto: UpdateAnimalDto) {
        const existing = await this.prisma.animales.findFirst({
            where: { id_animal: id, empresa_id: empresaId },
        });

        if (!existing) {
            throw new NotFoundException('Animal no encontrado');
        }

        const data: Record<string, unknown> = {};

        if (dto.nombre !== undefined) data.nombre = dto.nombre;
        if (dto.sexo !== undefined) data.sexo = dto.sexo;
        if (dto.fecha_nacimiento !== undefined) {
            data.fecha_nacimiento = dto.fecha_nacimiento
                ? new Date(dto.fecha_nacimiento)
                : null;
        }
        if (dto.fecha_nacimiento_estimada !== undefined) {
            data.fecha_nacimiento_estimada = dto.fecha_nacimiento_estimada;
        }
        if (dto.notas !== undefined) data.notas = dto.notas;
        if (dto.id_raza !== undefined) {
            data.id_raza = dto.id_raza ? parseBigInt(dto.id_raza, 'id_raza') : null;
        }
        if (dto.padre_id !== undefined) {
            data.padre_id = dto.padre_id
                ? parseBigInt(dto.padre_id, 'padre_id')
                : null;
        }
        if (dto.madre_id !== undefined) {
            data.madre_id = dto.madre_id
                ? parseBigInt(dto.madre_id, 'madre_id')
                : null;
        }
        if (dto.id_finca !== undefined) {
            const id_finca = parseBigInt(dto.id_finca, 'id_finca');
            const finca = await this.prisma.fincas.findFirst({
                where: { id_finca, empresa_id: empresaId },
            });
            if (!finca) {
                throw new NotFoundException('Finca no encontrada');
            }
            data.id_finca = id_finca;
        }

        data.updated_at = new Date();

        const animal = await this.prisma.animales.update({
            where: { id_animal_empresa_id: { id_animal: id, empresa_id: empresaId } },
            data: data as Parameters<typeof this.prisma.animales.update>[0]['data'],
            include: {
                fincas: { select: { nombre: true, id_finca: true } },
                razas: { select: { nombre: true, id_raza: true } },
            },
        });

        return this.mapAnimal(animal);
    }

    async remove(empresaId: bigint, id: bigint) {
        const existing = await this.prisma.animales.findFirst({
            where: { id_animal: id, empresa_id: empresaId },
        });

        if (!existing) {
            throw new NotFoundException('Animal no encontrado');
        }

        await this.prisma.animales.delete({
            where: { id_animal_empresa_id: { id_animal: id, empresa_id: empresaId } },
        });

        return { deleted: true };
    }

    private mapAnimal(animal: Record<string, unknown>) {
        const a = animal as {
            id_animal: bigint;
            empresa_id: bigint;
            id_finca: bigint;
            nombre: string | null;
            sexo: string;
            fecha_nacimiento: Date | null;
            fecha_nacimiento_estimada: boolean;
            id_raza: bigint | null;
            padre_id: bigint | null;
            madre_id: bigint | null;
            notas: string | null;
            created_at: Date;
            updated_at: Date;
            fincas?: { id_finca: bigint; nombre: string };
            razas?: { id_raza: bigint; nombre: string } | null;
            animales_animales_padre_id_empresa_idToanimales?: {
                id_animal: bigint;
                nombre: string | null;
            } | null;
            animales_animales_madre_id_empresa_idToanimales?: {
                id_animal: bigint;
                nombre: string | null;
            } | null;
        };

        return {
            id: a.id_animal.toString(),
            empresa_id: a.empresa_id.toString(),
            id_finca: a.id_finca.toString(),
            finca_nombre: a.fincas?.nombre ?? null,
            nombre: a.nombre,
            sexo: a.sexo,
            fecha_nacimiento: a.fecha_nacimiento,
            fecha_nacimiento_estimada: a.fecha_nacimiento_estimada,
            id_raza: a.id_raza?.toString() ?? null,
            raza_nombre: a.razas?.nombre ?? null,
            padre_id: a.padre_id?.toString() ?? null,
            padre_nombre:
                a.animales_animales_padre_id_empresa_idToanimales?.nombre ?? null,
            madre_id: a.madre_id?.toString() ?? null,
            madre_nombre:
                a.animales_animales_madre_id_empresa_idToanimales?.nombre ?? null,
            notas: a.notas,
            created_at: a.created_at,
            updated_at: a.updated_at,
        };
    }
}
