import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { parseBigInt } from '../common/utils/parse-bigint';
import { parsePagination, parsePaginationFromDto, paginatedResponse } from '../common/utils/pagination.util';
import { CreateEntregaLecheDto } from './dto/create-entrega-leche.dto';
import { QueryEntregaLecheDto } from './dto/query-entrega-leche.dto';

@Injectable()
export class LecheService {
    constructor(private readonly prisma: PrismaService) { }

    async findAllEntregas(empresaId: bigint, query: QueryEntregaLecheDto) {
        const pagination = parsePaginationFromDto(query);

        const where: Record<string, unknown> = { empresa_id: empresaId };

        if (query.id_finca) {
            where.id_finca = parseBigInt(query.id_finca, 'id_finca');
        }
        if (query.id_centro) {
            where.id_centro = parseBigInt(query.id_centro, 'id_centro');
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
            this.prisma.entregas_leche.findMany({
                where,
                skip: pagination.skip,
                take: pagination.take,
                orderBy: { fecha: 'desc' },
                include: {
                    fincas: { select: { nombre: true } },
                    centros_recepcion: { select: { nombre: true } },
                },
            }),
            this.prisma.entregas_leche.count({ where }),
        ]);

        const mapped = data.map((e) => ({
            id: e.id_entrega.toString(),
            id_finca: e.id_finca.toString(),
            finca_nombre: e.fincas.nombre,
            id_centro: e.id_centro.toString(),
            centro_nombre: e.centros_recepcion.nombre,
            fecha: e.fecha,
            litros_entregados: e.litros_entregados.toString(),
            referencia_guia: e.referencia_guia,
            notas: e.notas,
        }));

        return paginatedResponse(mapped, total, pagination);
    }

    async findOneEntrega(empresaId: bigint, id: bigint) {
        const entrega = await this.prisma.entregas_leche.findFirst({
            where: { id_entrega: id, empresa_id: empresaId },
            include: {
                fincas: { select: { nombre: true } },
                centros_recepcion: { select: { nombre: true } },
            },
        });

        if (!entrega) {
            throw new NotFoundException('Entrega no encontrada');
        }

        return {
            id: entrega.id_entrega.toString(),
            id_finca: entrega.id_finca.toString(),
            finca_nombre: entrega.fincas.nombre,
            id_centro: entrega.id_centro.toString(),
            centro_nombre: entrega.centros_recepcion.nombre,
            fecha: entrega.fecha,
            litros_entregados: entrega.litros_entregados.toString(),
            referencia_guia: entrega.referencia_guia,
            notas: entrega.notas,
        };
    }

    async createEntrega(empresaId: bigint, dto: CreateEntregaLecheDto) {
        const id_finca = parseBigInt(dto.id_finca, 'id_finca');
        const id_centro = parseBigInt(dto.id_centro, 'id_centro');

        const finca = await this.prisma.fincas.findFirst({
            where: { id_finca, empresa_id: empresaId },
        });
        if (!finca) {
            throw new NotFoundException('Finca no encontrada');
        }

        const entrega = await this.prisma.entregas_leche.create({
            data: {
                empresa_id: empresaId,
                id_finca,
                id_centro,
                fecha: new Date(dto.fecha),
                litros_entregados: parseFloat(dto.litros_entregados),
                referencia_guia: dto.referencia_guia ?? null,
                notas: dto.notas ?? null,
            },
        });

        return { id: entrega.id_entrega.toString(), created: true };
    }

    async removeEntrega(empresaId: bigint, id: bigint) {
        const existing = await this.prisma.entregas_leche.findFirst({
            where: { id_entrega: id, empresa_id: empresaId },
        });

        if (!existing) {
            throw new NotFoundException('Entrega no encontrada');
        }

        await this.prisma.entregas_leche.delete({
            where: { id_entrega: id },
        });

        return { deleted: true };
    }

    async findAllLiquidaciones(empresaId: bigint) {
        const liquidaciones = await this.prisma.liquidaciones_leche.findMany({
            where: { empresa_id: empresaId },
            orderBy: { fecha_inicio: 'desc' },
            take: 50,
            include: {
                fincas: { select: { nombre: true } },
                centros_recepcion: { select: { nombre: true } },
                monedas: { select: { codigo: true, simbolo: true } },
            },
        });

        return liquidaciones.map((l) => ({
            id: l.id_liquidacion.toString(),
            id_finca: l.id_finca.toString(),
            finca_nombre: l.fincas.nombre,
            id_centro: l.id_centro.toString(),
            centro_nombre: l.centros_recepcion.nombre,
            fecha_inicio: l.fecha_inicio,
            fecha_fin: l.fecha_fin,
            litros_pagados: l.litros_pagados.toString(),
            precio_por_litro: l.precio_por_litro?.toString() ?? null,
            monto_pagado: l.monto_pagado?.toString() ?? null,
            moneda: l.monedas.codigo,
            moneda_simbolo: l.monedas.simbolo,
        }));
    }

    async getConciliacion(empresaId: bigint, fechaInicio: string, fechaFin: string) {
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);

        // Get total entregas in period
        const entregas = await this.prisma.entregas_leche.aggregate({
            where: {
                empresa_id: empresaId,
                fecha: { gte: inicio, lte: fin },
            },
            _sum: { litros_entregados: true },
            _count: true,
        });

        // Get liquidaciones in period
        const liquidaciones = await this.prisma.liquidaciones_leche.aggregate({
            where: {
                empresa_id: empresaId,
                fecha_inicio: { gte: inicio },
                fecha_fin: { lte: fin },
            },
            _sum: { litros_pagados: true, monto_pagado: true },
            _count: true,
        });

        const totalEntregado = Number(entregas._sum.litros_entregados ?? 0);
        const totalLiquidado = Number(liquidaciones._sum.litros_pagados ?? 0);
        const diferencia = totalEntregado - totalLiquidado;

        return {
            periodo: { inicio, fin },
            entregas: {
                cantidad: entregas._count,
                total_litros: totalEntregado.toString(),
            },
            liquidaciones: {
                cantidad: liquidaciones._count,
                total_litros: totalLiquidado.toString(),
                total_monto: liquidaciones._sum.monto_pagado?.toString() ?? '0',
            },
            diferencia_litros: diferencia.toString(),
            conciliado: diferencia === 0,
        };
    }

    async getCentrosRecepcion(empresaId: bigint) {
        const centros = await this.prisma.centros_recepcion.findMany({
            where: { empresa_id: empresaId },
            orderBy: { nombre: 'asc' },
        });

        return centros.map((c) => ({
            id: c.id_centro.toString(),
            nombre: c.nombre,
            contacto: c.contacto,
            telefono: c.telefono,
            notas: c.notas,
        }));
    }

    async getTurnosOrdenio(empresaId: bigint) {
        // Get global + empresa-specific
        const turnos = await this.prisma.turnos_ordenio.findMany({
            where: {
                OR: [{ empresa_id: null }, { empresa_id: empresaId }],
            },
            orderBy: { codigo: 'asc' },
        });

        return turnos.map((t) => ({
            id: t.id_turno.toString(),
            codigo: t.codigo,
            nombre: t.nombre,
            es_global: t.empresa_id === null,
        }));
    }
}
