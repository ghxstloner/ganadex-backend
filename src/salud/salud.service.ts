import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { parseBigInt } from '../common/utils/parse-bigint';
import { parsePagination, paginatedResponse } from '../common/utils/pagination.util';
import { CreateEventoSanitarioDto } from './dto/create-evento-sanitario.dto';
import { CreateTratamientoDto } from './dto/create-tratamiento.dto';
import { QueryEventoSanitarioDto } from './dto/query-evento-sanitario.dto';
import { UpdateEventoSanitarioDto } from './dto/update-evento-sanitario.dto';

@Injectable()
export class SaludService {
    constructor(private readonly prisma: PrismaService) { }

    async findAllEventos(empresaId: bigint, query: QueryEventoSanitarioDto) {
        const pagination = parsePagination(query.page, query.pageSize);

        const where: Record<string, unknown> = { empresa_id: empresaId };

        if (query.id_animal) {
            where.id_animal = parseBigInt(query.id_animal, 'id_animal');
        }
        if (query.id_enfermedad) {
            where.id_enfermedad = parseBigInt(query.id_enfermedad, 'id_enfermedad');
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
            this.prisma.eventos_sanitarios.findMany({
                where,
                skip: pagination.skip,
                take: pagination.take,
                orderBy: { fecha: 'desc' },
                include: {
                    animales: { select: { nombre: true, id_animal: true } },
                    enfermedades: { select: { nombre: true } },
                },
            }),
            this.prisma.eventos_sanitarios.count({ where }),
        ]);

        const mapped = data.map((e) => ({
            id: e.id_evento_sanitario.toString(),
            id_animal: e.id_animal.toString(),
            animal_nombre: e.animales?.nombre ?? null,
            fecha: e.fecha,
            id_enfermedad: e.id_enfermedad?.toString() ?? null,
            enfermedad_nombre: e.enfermedades?.nombre ?? null,
            descripcion: e.descripcion,
        }));

        return paginatedResponse(mapped, total, pagination);
    }

    async findOneEvento(empresaId: bigint, id: bigint) {
        const evento = await this.prisma.eventos_sanitarios.findFirst({
            where: { id_evento_sanitario: id, empresa_id: empresaId },
            include: {
                animales: { select: { nombre: true, id_animal: true } },
                enfermedades: { select: { nombre: true } },
                tratamientos: {
                    include: {
                        medicamentos: { select: { nombre: true } },
                        retiros: { include: { tipos_retiro: true } },
                    },
                },
            },
        });

        if (!evento) {
            throw new NotFoundException('Evento sanitario no encontrado');
        }

        return {
            id: evento.id_evento_sanitario.toString(),
            id_animal: evento.id_animal.toString(),
            animal_nombre: evento.animales?.nombre ?? null,
            fecha: evento.fecha,
            id_enfermedad: evento.id_enfermedad?.toString() ?? null,
            enfermedad_nombre: evento.enfermedades?.nombre ?? null,
            descripcion: evento.descripcion,
            tratamientos: evento.tratamientos.map((t) => ({
                id: t.id_tratamiento.toString(),
                fecha_inicio: t.fecha_inicio,
                medicamento: t.medicamentos.nombre,
                dosis: t.dosis,
                via_administracion: t.via_administracion,
                retiros: t.retiros.map((r) => ({
                    id: r.id_retiro.toString(),
                    tipo: r.tipos_retiro.nombre,
                    fecha_inicio: r.fecha_inicio,
                    fecha_fin: r.fecha_fin,
                    activo: r.activo,
                })),
            })),
        };
    }

    async createEvento(empresaId: bigint, dto: CreateEventoSanitarioDto) {
        const id_animal = parseBigInt(dto.id_animal, 'id_animal');

        const animal = await this.prisma.animales.findFirst({
            where: { id_animal, empresa_id: empresaId },
        });
        if (!animal) {
            throw new NotFoundException('Animal no encontrado');
        }

        const data: Record<string, unknown> = {
            empresa_id: empresaId,
            id_animal,
            fecha: new Date(dto.fecha),
            descripcion: dto.descripcion ?? null,
        };

        if (dto.id_enfermedad) {
            data.id_enfermedad = parseBigInt(dto.id_enfermedad, 'id_enfermedad');
        }

        const evento = await this.prisma.eventos_sanitarios.create({
            data: data as Parameters<typeof this.prisma.eventos_sanitarios.create>[0]['data'],
            include: {
                animales: { select: { nombre: true } },
                enfermedades: { select: { nombre: true } },
            },
        });

        return {
            id: evento.id_evento_sanitario.toString(),
            id_animal: evento.id_animal.toString(),
            fecha: evento.fecha,
            enfermedad_nombre: evento.enfermedades?.nombre ?? null,
            descripcion: evento.descripcion,
        };
    }

    async updateEvento(empresaId: bigint, id: bigint, dto: UpdateEventoSanitarioDto) {
        const existing = await this.prisma.eventos_sanitarios.findFirst({
            where: { id_evento_sanitario: id, empresa_id: empresaId },
        });

        if (!existing) {
            throw new NotFoundException('Evento sanitario no encontrado');
        }

        const data: Record<string, unknown> = {};
        if (dto.fecha !== undefined) data.fecha = new Date(dto.fecha);
        if (dto.descripcion !== undefined) data.descripcion = dto.descripcion;
        if (dto.id_enfermedad !== undefined) {
            data.id_enfermedad = dto.id_enfermedad ? parseBigInt(dto.id_enfermedad, 'id_enfermedad') : null;
        }

        const evento = await this.prisma.eventos_sanitarios.update({
            where: { id_evento_sanitario: id },
            data,
        });

        return { id: evento.id_evento_sanitario.toString(), updated: true };
    }

    async removeEvento(empresaId: bigint, id: bigint) {
        const existing = await this.prisma.eventos_sanitarios.findFirst({
            where: { id_evento_sanitario: id, empresa_id: empresaId },
        });

        if (!existing) {
            throw new NotFoundException('Evento sanitario no encontrado');
        }

        await this.prisma.eventos_sanitarios.delete({
            where: { id_evento_sanitario: id },
        });

        return { deleted: true };
    }

    async findAllTratamientos(empresaId: bigint) {
        const tratamientos = await this.prisma.tratamientos.findMany({
            where: { empresa_id: empresaId },
            orderBy: { fecha_inicio: 'desc' },
            take: 100,
            include: {
                animales: { select: { nombre: true, id_animal: true } },
                medicamentos: { select: { nombre: true } },
                retiros: { include: { tipos_retiro: true } },
            },
        });

        return tratamientos.map((t) => ({
            id: t.id_tratamiento.toString(),
            id_animal: t.id_animal.toString(),
            animal_nombre: t.animales?.nombre ?? null,
            fecha_inicio: t.fecha_inicio,
            medicamento: t.medicamentos.nombre,
            dosis: t.dosis,
            via_administracion: t.via_administracion,
            notas: t.notas,
            retiros: t.retiros.map((r) => ({
                id: r.id_retiro.toString(),
                tipo: r.tipos_retiro.nombre,
                codigo_tipo: r.tipos_retiro.codigo,
                fecha_inicio: r.fecha_inicio,
                fecha_fin: r.fecha_fin,
                activo: r.activo,
            })),
        }));
    }

    async createTratamiento(empresaId: bigint, dto: CreateTratamientoDto) {
        const id_animal = parseBigInt(dto.id_animal, 'id_animal');
        const id_medicamento = parseBigInt(dto.id_medicamento, 'id_medicamento');
        const fecha_inicio = new Date(dto.fecha_inicio);

        const animal = await this.prisma.animales.findFirst({
            where: { id_animal, empresa_id: empresaId },
        });
        if (!animal) {
            throw new NotFoundException('Animal no encontrado');
        }

        const tratamientoData: Record<string, unknown> = {
            empresa_id: empresaId,
            id_animal,
            id_medicamento,
            fecha_inicio,
            dosis: dto.dosis ?? null,
            via_administracion: dto.via_administracion ?? null,
            notas: dto.notas ?? null,
        };

        if (dto.id_evento_sanitario) {
            tratamientoData.id_evento_sanitario = parseBigInt(dto.id_evento_sanitario, 'id_evento_sanitario');
        }

        const tratamiento = await this.prisma.tratamientos.create({
            data: tratamientoData as Parameters<typeof this.prisma.tratamientos.create>[0]['data'],
        });

        // Create retiro if specified
        if (dto.id_tipo_retiro && dto.dias_retiro !== undefined && dto.dias_retiro > 0) {
            const fecha_fin = new Date(fecha_inicio);
            fecha_fin.setDate(fecha_fin.getDate() + dto.dias_retiro);

            await this.prisma.retiros.create({
                data: {
                    id_tratamiento: tratamiento.id_tratamiento,
                    id_tipo_retiro: parseBigInt(dto.id_tipo_retiro, 'id_tipo_retiro'),
                    dias_retiro: dto.dias_retiro,
                    fecha_inicio,
                    fecha_fin,
                    activo: true,
                },
            });
        }

        return { id: tratamiento.id_tratamiento.toString(), created: true };
    }

    async getAlertas(empresaId: bigint) {
        const hoy = new Date();

        // Find active retiros
        const retirosActivos = await this.prisma.retiros.findMany({
            where: {
                activo: true,
                fecha_fin: { gte: hoy },
                tratamientos: { empresa_id: empresaId },
            },
            include: {
                tipos_retiro: true,
                tratamientos: {
                    include: {
                        animales: { select: { id_animal: true, nombre: true } },
                        medicamentos: { select: { nombre: true } },
                    },
                },
            },
        });

        const alertas = retirosActivos.map((r) => ({
            id_retiro: r.id_retiro.toString(),
            id_animal: r.tratamientos.id_animal.toString(),
            animal_nombre: r.tratamientos.animales?.nombre ?? null,
            tipo_retiro: r.tipos_retiro.nombre,
            codigo_tipo: r.tipos_retiro.codigo,
            medicamento: r.tratamientos.medicamentos.nombre,
            fecha_inicio: r.fecha_inicio,
            fecha_fin: r.fecha_fin,
            dias_restantes: Math.ceil((r.fecha_fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)),
        }));

        return alertas;
    }

    async getRestricciones(empresaId: bigint, animalId: bigint) {
        const animal = await this.prisma.animales.findFirst({
            where: { id_animal: animalId, empresa_id: empresaId },
        });
        if (!animal) {
            throw new NotFoundException('Animal no encontrado');
        }

        const hoy = new Date();

        const retirosActivos = await this.prisma.retiros.findMany({
            where: {
                activo: true,
                fecha_fin: { gte: hoy },
                tratamientos: { id_animal: animalId, empresa_id: empresaId },
            },
            include: {
                tipos_retiro: true,
                tratamientos: { include: { medicamentos: true } },
            },
        });

        const retiroLeche = retirosActivos.find((r) => r.tipos_retiro.codigo === 'leche' || r.tipos_retiro.codigo === 'LECHE');
        const retiroCarne = retirosActivos.find((r) => r.tipos_retiro.codigo === 'carne' || r.tipos_retiro.codigo === 'CARNE');

        const getRetiroInfo = (retiro: typeof retiroLeche) => {
            if (!retiro) return null;
            return {
                hasta: retiro.fecha_fin,
                medicamento: retiro.tratamientos.medicamentos.nombre,
                dias_restantes: Math.ceil((retiro.fecha_fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)),
            };
        };

        return {
            retiroLecheActivo: !!retiroLeche,
            retiroLecheInfo: getRetiroInfo(retiroLeche),
            retiroCarneActivo: !!retiroCarne,
            retiroCarneInfo: getRetiroInfo(retiroCarne),
            hasta: retirosActivos.length > 0
                ? retirosActivos.reduce((max, r) => r.fecha_fin > max ? r.fecha_fin : max, retirosActivos[0].fecha_fin)
                : null,
            notas: retirosActivos.map((r) => `${r.tipos_retiro.nombre}: ${r.tratamientos.medicamentos.nombre} hasta ${r.fecha_fin.toISOString().split('T')[0]}`).join('; ') || null,
        };
    }
}
