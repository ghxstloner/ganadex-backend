import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { parseBigInt } from '../common/utils/parse-bigint';
import {
  parsePagination,
  parsePaginationFromDto,
  paginatedResponse,
} from '../common/utils/pagination.util';
import { CreateTransaccionDto } from './dto/create-transaccion.dto';
import { QueryTransaccionDto } from './dto/query-transaccion.dto';
import { UpdateTransaccionDto } from './dto/update-transaccion.dto';

@Injectable()
export class FinanzasService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllTransacciones(empresaId: bigint, query: QueryTransaccionDto) {
    const pagination = parsePaginationFromDto(query);

    const where: Record<string, unknown> = { empresa_id: empresaId };

    if (query.id_tipo) {
      where.id_tipo_transaccion = parseBigInt(query.id_tipo, 'id_tipo');
    }
    if (query.id_categoria) {
      where.id_categoria_financiera = parseBigInt(
        query.id_categoria,
        'id_categoria',
      );
    }
    if (query.fecha_desde || query.fecha_hasta) {
      where.fecha = {};
      if (query.fecha_desde) {
        (where.fecha as Record<string, unknown>).gte = new Date(
          query.fecha_desde,
        );
      }
      if (query.fecha_hasta) {
        (where.fecha as Record<string, unknown>).lte = new Date(
          query.fecha_hasta,
        );
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.transacciones_financieras.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { fecha: 'desc' },
        include: {
          tipos_transaccion: { select: { nombre: true, codigo: true } },
          categorias_financieras: { select: { nombre: true, codigo: true } },
        },
      }),
      this.prisma.transacciones_financieras.count({ where }),
    ]);

    const mapped = data.map((t) => ({
      id: t.id_transaccion.toString(),
      fecha: t.fecha,
      id_tipo: t.id_tipo_transaccion.toString(),
      tipo_nombre: t.tipos_transaccion.nombre,
      tipo_codigo: t.tipos_transaccion.codigo,
      id_categoria: t.id_categoria_financiera.toString(),
      categoria_nombre: t.categorias_financieras.nombre,
      monto: t.monto.toString(),
      descripcion: t.descripcion,
    }));

    return paginatedResponse(mapped, total, pagination);
  }

  async findOneTransaccion(empresaId: bigint, id: bigint) {
    const transaccion = await this.prisma.transacciones_financieras.findFirst({
      where: { id_transaccion: id, empresa_id: empresaId },
      include: {
        tipos_transaccion: { select: { nombre: true, codigo: true } },
        categorias_financieras: { select: { nombre: true, codigo: true } },
        adjuntos_transaccion: {
          include: { tipos_adjunto: true },
        },
      },
    });

    if (!transaccion) {
      throw new NotFoundException('Transacción no encontrada');
    }

    return {
      id: transaccion.id_transaccion.toString(),
      fecha: transaccion.fecha,
      id_tipo: transaccion.id_tipo_transaccion.toString(),
      tipo_nombre: transaccion.tipos_transaccion.nombre,
      tipo_codigo: transaccion.tipos_transaccion.codigo,
      id_categoria: transaccion.id_categoria_financiera.toString(),
      categoria_nombre: transaccion.categorias_financieras.nombre,
      monto: transaccion.monto.toString(),
      descripcion: transaccion.descripcion,
      adjuntos: transaccion.adjuntos_transaccion.map((a) => ({
        id: a.id_adjunto.toString(),
        tipo: a.tipos_adjunto.nombre,
        url: a.url_archivo,
        notas: a.notas,
      })),
    };
  }

  async createTransaccion(empresaId: bigint, dto: CreateTransaccionDto) {
    const transaccion = await this.prisma.transacciones_financieras.create({
      data: {
        empresa_id: empresaId,
        fecha: new Date(dto.fecha),
        id_tipo_transaccion: parseBigInt(
          dto.id_tipo_transaccion,
          'id_tipo_transaccion',
        ),
        id_categoria_financiera: parseBigInt(
          dto.id_categoria_financiera,
          'id_categoria_financiera',
        ),
        monto: parseFloat(dto.monto),
        descripcion: dto.descripcion ?? null,
        id_tercero: dto.id_tercero
          ? parseBigInt(dto.id_tercero, 'id_tercero')
          : null,
      },
    });

    return { id: transaccion.id_transaccion.toString(), created: true };
  }

  async updateTransaccion(
    empresaId: bigint,
    id: bigint,
    dto: UpdateTransaccionDto,
  ) {
    const existing = await this.prisma.transacciones_financieras.findFirst({
      where: { id_transaccion: id, empresa_id: empresaId },
    });

    if (!existing) {
      throw new NotFoundException('Transacción no encontrada');
    }

    const data: Record<string, unknown> = {};

    if (dto.fecha !== undefined) data.fecha = new Date(dto.fecha);
    if (dto.monto !== undefined) data.monto = parseFloat(dto.monto);
    if (dto.descripcion !== undefined) data.descripcion = dto.descripcion;
    if (dto.id_tipo_transaccion !== undefined) {
      data.id_tipo_transaccion = parseBigInt(
        dto.id_tipo_transaccion,
        'id_tipo_transaccion',
      );
    }
    if (dto.id_categoria_financiera !== undefined) {
      data.id_categoria_financiera = parseBigInt(
        dto.id_categoria_financiera,
        'id_categoria_financiera',
      );
    }

    await this.prisma.transacciones_financieras.update({
      where: { id_transaccion: id },
      data,
    });

    return { id: id.toString(), updated: true };
  }

  async removeTransaccion(empresaId: bigint, id: bigint) {
    const existing = await this.prisma.transacciones_financieras.findFirst({
      where: { id_transaccion: id, empresa_id: empresaId },
    });

    if (!existing) {
      throw new NotFoundException('Transacción no encontrada');
    }

    await this.prisma.transacciones_financieras.delete({
      where: { id_transaccion: id },
    });

    return { deleted: true };
  }

  async getTiposTransaccion(empresaId: bigint) {
    const tipos = await this.prisma.tipos_transaccion.findMany({
      where: {
        OR: [{ empresa_id: null }, { empresa_id: empresaId }],
      },
      orderBy: { codigo: 'asc' },
    });

    return tipos.map((t) => ({
      id: t.id_tipo_transaccion.toString(),
      codigo: t.codigo,
      nombre: t.nombre,
      es_global: t.empresa_id === null,
    }));
  }

  async getCategoriasFinancieras(empresaId: bigint) {
    const categorias = await this.prisma.categorias_financieras.findMany({
      where: {
        OR: [{ empresa_id: null }, { empresa_id: empresaId }],
        activo: true,
      },
      orderBy: { orden: 'asc' },
      include: {
        tipos_transaccion: { select: { codigo: true, nombre: true } },
      },
    });

    return categorias.map((c) => ({
      id: c.id_categoria_financiera.toString(),
      codigo: c.codigo,
      nombre: c.nombre,
      tipo_transaccion: c.tipos_transaccion.nombre,
      tipo_codigo: c.tipos_transaccion.codigo,
      es_global: c.empresa_id === null,
    }));
  }

  async getMonedas() {
    const monedas = await this.prisma.monedas.findMany({
      where: { activo: true },
      select: {
        id_moneda: true,
        iso_alpha3: true,
        nombre: true,
        simbolo: true,
        decimales: true,
        activo: true,
      },
      orderBy: { nombre: 'asc' },
    });

    return monedas.map((m) => ({
      id: m.id_moneda.toString(),
      iso_alpha3: m.iso_alpha3,
      nombre: m.nombre,
      simbolo: m.simbolo,
      decimales: m.decimales,
      activo: m.activo,
    }));
  }
}
