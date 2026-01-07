import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { parseBigInt } from '../common/utils/parse-bigint';
import { parsePagination, parsePaginationFromDto, paginatedResponse } from '../common/utils/pagination.util';
import { CreateEventoReproductivoDto } from './dto/create-evento-reproductivo.dto';
import { QueryEventoReproductivoDto } from './dto/query-evento-reproductivo.dto';
import { UpdateEventoReproductivoDto } from './dto/update-evento-reproductivo.dto';

@Injectable()
export class ReproduccionService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(empresaId: bigint, query: QueryEventoReproductivoDto) {
        const pagination = parsePaginationFromDto(query);

        const where: Record<string, unknown> = { empresa_id: empresaId };

        if (query.id_animal) {
            where.id_animal = parseBigInt(query.id_animal, 'id_animal');
        }
        if (query.id_tipo) {
            where.id_tipo_evento_reproductivo = parseBigInt(query.id_tipo, 'id_tipo');
        }
        if (query.fecha_desde || query.fecha_hasta) {
            where.fecha = {};
            if (query.fecha_desde) {
                (where.fecha as Record<string, unknown>).gte = new Date(query.fecha_desde);
            }
            if (query.fecha_hasta) {
                (where.fecha as Record<string, unknown>).lte = new Date(query.fecha_hasta);
            }
        }

        const [data, total] = await Promise.all([
            this.prisma.eventos_reproductivos.findMany({
                where,
                skip: pagination.skip,
                take: pagination.take,
                orderBy: { fecha: 'desc' },
                include: {
                    animales_eventos_reproductivos_id_animal_empresa_idToanimales: { select: { nombre: true, id_animal: true } },
                    tipos_evento_reproductivo: { select: { nombre: true, codigo: true } },
                    resultados_palpacion: { select: { nombre: true } },
                },
            }),
            this.prisma.eventos_reproductivos.count({ where }),
        ]);

        const mapped = data.map((e) => this.mapEvento(e));
        return paginatedResponse(mapped, total, pagination);
    }

    async findOne(empresaId: bigint, id: bigint) {
        const evento = await this.prisma.eventos_reproductivos.findFirst({
            where: { id_evento_reproductivo: id, empresa_id: empresaId },
            include: {
                animales_eventos_reproductivos_id_animal_empresa_idToanimales: { select: { nombre: true, id_animal: true } },
                tipos_evento_reproductivo: { select: { nombre: true, codigo: true } },
                resultados_palpacion: { select: { nombre: true } },
            },
        });

        if (!evento) {
            throw new NotFoundException('Evento reproductivo no encontrado');
        }

        return this.mapEvento(evento);
    }

    async create(empresaId: bigint, dto: CreateEventoReproductivoDto) {
        const id_animal = parseBigInt(dto.id_animal, 'id_animal');
        const id_tipo = parseBigInt(dto.id_tipo_evento_reproductivo, 'id_tipo_evento_reproductivo');
        const fecha = new Date(dto.fecha);

        // Verify animal belongs to empresa
        const animal = await this.prisma.animales.findFirst({
            where: { id_animal, empresa_id: empresaId },
        });
        if (!animal) {
            throw new NotFoundException('Animal no encontrado');
        }

        // Get tipo evento to validate business rules
        const tipoEvento = await this.prisma.tipos_evento_reproductivo.findFirst({
            where: { id_tipo_evento_reproductivo: id_tipo },
        });

        // Business rule: parto must be after servicio
        if (tipoEvento?.codigo === 'parto') {
            const ultimoServicio = await this.prisma.eventos_reproductivos.findFirst({
                where: {
                    id_animal,
                    empresa_id: empresaId,
                    tipos_evento_reproductivo: { codigo: 'servicio' },
                },
                orderBy: { fecha: 'desc' },
            });

            if (ultimoServicio && fecha <= ultimoServicio.fecha) {
                throw new BadRequestException('La fecha de parto debe ser posterior a la fecha de servicio');
            }
        }

        const data: Record<string, unknown> = {
            empresa_id: empresaId,
            id_animal,
            id_tipo_evento_reproductivo: id_tipo,
            fecha,
            detalles: dto.detalles ?? null,
            reproductor_identificacion: dto.reproductor_identificacion ?? null,
        };

        if (dto.id_resultado_palpacion) {
            data.id_resultado_palpacion = parseBigInt(dto.id_resultado_palpacion, 'id_resultado_palpacion');
        }
        if (dto.reproductor_id) {
            data.reproductor_id = parseBigInt(dto.reproductor_id, 'reproductor_id');
        }

        const evento = await this.prisma.eventos_reproductivos.create({
            data: data as any,
            include: {
                animales_eventos_reproductivos_id_animal_empresa_idToanimales: { select: { nombre: true, id_animal: true } },
                tipos_evento_reproductivo: { select: { nombre: true, codigo: true } },
            },
        });

        return this.mapEvento(evento);
    }

    async update(empresaId: bigint, id: bigint, dto: UpdateEventoReproductivoDto) {
        const existing = await this.prisma.eventos_reproductivos.findFirst({
            where: { id_evento_reproductivo: id, empresa_id: empresaId },
        });

        if (!existing) {
            throw new NotFoundException('Evento reproductivo no encontrado');
        }

        const data: Record<string, unknown> = {};

        if (dto.fecha !== undefined) data.fecha = new Date(dto.fecha);
        if (dto.detalles !== undefined) data.detalles = dto.detalles;
        if (dto.reproductor_identificacion !== undefined) data.reproductor_identificacion = dto.reproductor_identificacion;
        if (dto.id_resultado_palpacion !== undefined) {
            data.id_resultado_palpacion = dto.id_resultado_palpacion ? parseBigInt(dto.id_resultado_palpacion, 'id_resultado_palpacion') : null;
        }
        if (dto.reproductor_id !== undefined) {
            data.reproductor_id = dto.reproductor_id ? parseBigInt(dto.reproductor_id, 'reproductor_id') : null;
        }
        if (dto.id_tipo_evento_reproductivo !== undefined) {
            data.id_tipo_evento_reproductivo = parseBigInt(dto.id_tipo_evento_reproductivo, 'id_tipo_evento_reproductivo');
        }

        const evento = await this.prisma.eventos_reproductivos.update({
            where: { id_evento_reproductivo: id },
            data,
            include: {
                animales_eventos_reproductivos_id_animal_empresa_idToanimales: { select: { nombre: true, id_animal: true } },
                tipos_evento_reproductivo: { select: { nombre: true, codigo: true } },
            },
        });

        return this.mapEvento(evento);
    }

    async remove(empresaId: bigint, id: bigint) {
        const existing = await this.prisma.eventos_reproductivos.findFirst({
            where: { id_evento_reproductivo: id, empresa_id: empresaId },
        });

        if (!existing) {
            throw new NotFoundException('Evento reproductivo no encontrado');
        }

        await this.prisma.eventos_reproductivos.delete({
            where: { id_evento_reproductivo: id },
        });

        return { deleted: true };
    }

    async getSemaforo(empresaId: bigint) {
        // Get all female animals in the empresa
        const hembras = await this.prisma.animales.findMany({
            where: { empresa_id: empresaId, sexo: 'F' },
            include: {
                eventos_reproductivos_eventos_reproductivos_id_animal_empresa_idToanimales: {
                    orderBy: { fecha: 'desc' },
                    take: 10,
                    include: { tipos_evento_reproductivo: true, resultados_palpacion: true },
                },
            },
        });

        const hoy = new Date();

        return hembras.map((animal) => {
            const eventos = animal.eventos_reproductivos_eventos_reproductivos_id_animal_empresa_idToanimales;

            const ultimoServicio = eventos.find(e => e.tipos_evento_reproductivo.codigo === 'servicio');
            const ultimaPalpacion = eventos.find(e => e.tipos_evento_reproductivo.codigo === 'palpacion');
            const ultimoParto = eventos.find(e => e.tipos_evento_reproductivo.codigo === 'parto');

            let diasAbiertos: number | null = null;
            if (ultimoParto) {
                diasAbiertos = Math.floor((hoy.getTime() - ultimoParto.fecha.getTime()) / (1000 * 60 * 60 * 24));
            }

            let estadoPreñez = 'desconocido';
            if (ultimaPalpacion?.resultados_palpacion) {
                estadoPreñez = ultimaPalpacion.resultados_palpacion.codigo;
            }

            return {
                id_animal: animal.id_animal.toString(),
                nombre: animal.nombre,
                dias_abiertos: diasAbiertos,
                ultimo_servicio: ultimoServicio ? { fecha: ultimoServicio.fecha, detalles: ultimoServicio.detalles } : null,
                ultima_palpacion: ultimaPalpacion ? { fecha: ultimaPalpacion.fecha, resultado: ultimaPalpacion.resultados_palpacion?.nombre } : null,
                ultimo_parto: ultimoParto?.fecha ?? null,
                estado_prenez: estadoPreñez,
            };
        });
    }

    private mapEvento(e: Record<string, unknown>) {
        const evento = e as {
            id_evento_reproductivo: bigint;
            empresa_id: bigint;
            id_animal: bigint;
            id_tipo_evento_reproductivo: bigint;
            fecha: Date;
            detalles: string | null;
            id_resultado_palpacion: bigint | null;
            reproductor_id: bigint | null;
            reproductor_identificacion: string | null;
            animales_eventos_reproductivos_id_animal_empresa_idToanimales?: { id_animal: bigint; nombre: string | null };
            tipos_evento_reproductivo: { nombre: string; codigo: string };
            resultados_palpacion?: { nombre: string } | null;
        };

        return {
            id: evento.id_evento_reproductivo.toString(),
            empresa_id: evento.empresa_id.toString(),
            id_animal: evento.id_animal.toString(),
            animal_nombre: evento.animales_eventos_reproductivos_id_animal_empresa_idToanimales?.nombre ?? null,
            id_tipo: evento.id_tipo_evento_reproductivo.toString(),
            tipo_nombre: evento.tipos_evento_reproductivo.nombre,
            tipo_codigo: evento.tipos_evento_reproductivo.codigo,
            fecha: evento.fecha,
            detalles: evento.detalles,
            id_resultado_palpacion: evento.id_resultado_palpacion?.toString() ?? null,
            resultado_palpacion_nombre: evento.resultados_palpacion?.nombre ?? null,
            reproductor_id: evento.reproductor_id?.toString() ?? null,
            reproductor_identificacion: evento.reproductor_identificacion,
        };
    }
}
