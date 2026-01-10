import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { parseBigInt } from '../common/utils/parse-bigint';
import {
  parsePagination,
  parsePaginationFromDto,
  paginatedResponse,
} from '../common/utils/pagination.util';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { QueryMovimientoDto } from './dto/query-movimiento.dto';
import { UpdateMovimientoDto } from './dto/update-movimiento.dto';

@Injectable()
export class MovimientosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(empresaId: bigint, query: QueryMovimientoDto) {
    const pagination = parsePaginationFromDto(query);

    const where: Record<string, unknown> = { empresa_id: empresaId };

    if (query.id_animal) {
      where.id_animal = parseBigInt(query.id_animal, 'id_animal');
    }
    if (query.id_finca) {
      where.id_finca = parseBigInt(query.id_finca, 'id_finca');
    }
    if (query.id_lote) {
      const loteId = parseBigInt(query.id_lote, 'id_lote');
      where.OR = [{ lote_origen_id: loteId }, { lote_destino_id: loteId }];
    }
    if (query.id_motivo) {
      where.id_motivo_movimiento = parseBigInt(query.id_motivo, 'id_motivo');
    }
    if (query.fecha_desde || query.fecha_hasta) {
      where.fecha_hora = {};
      if (query.fecha_desde) {
        (where.fecha_hora as Record<string, unknown>).gte = new Date(
          query.fecha_desde,
        );
      }
      if (query.fecha_hasta) {
        (where.fecha_hora as Record<string, unknown>).lte = new Date(
          query.fecha_hasta,
        );
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.movimientos_animales.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { fecha_hora: 'desc' },
        include: {
          animales: { select: { nombre: true, id_animal: true } },
          motivos_movimiento: { select: { nombre: true } },
          lotes_movimientos_animales_lote_origen_id_empresa_idTolotes: {
            select: { nombre: true },
          },
          lotes_movimientos_animales_lote_destino_id_empresa_idTolotes: {
            select: { nombre: true },
          },
          potreros_movimientos_animales_potrero_origen_id_empresa_idTopotreros:
            { select: { nombre: true } },
          potreros_movimientos_animales_potrero_destino_id_empresa_idTopotreros:
            { select: { nombre: true } },
        },
      }),
      this.prisma.movimientos_animales.count({ where }),
    ]);

    const mapped = data.map((m) => this.mapMovimiento(m));
    return paginatedResponse(mapped, total, pagination);
  }

  async findOne(empresaId: bigint, id: bigint) {
    const movimiento = await this.prisma.movimientos_animales.findFirst({
      where: { id_movimiento: id, empresa_id: empresaId },
      include: {
        animales: { select: { nombre: true, id_animal: true } },
        motivos_movimiento: { select: { nombre: true } },
        lotes_movimientos_animales_lote_origen_id_empresa_idTolotes: {
          select: { nombre: true },
        },
        lotes_movimientos_animales_lote_destino_id_empresa_idTolotes: {
          select: { nombre: true },
        },
        potreros_movimientos_animales_potrero_origen_id_empresa_idTopotreros: {
          select: { nombre: true },
        },
        potreros_movimientos_animales_potrero_destino_id_empresa_idTopotreros: {
          select: { nombre: true },
        },
      },
    });

    if (!movimiento) {
      throw new NotFoundException('Movimiento no encontrado');
    }

    return this.mapMovimiento(movimiento);
  }

  async create(empresaId: bigint, dto: CreateMovimientoDto) {
    const id_finca = parseBigInt(dto.id_finca, 'id_finca');
    const id_animal = parseBigInt(dto.id_animal, 'id_animal');

    // Verify animal and finca belong to empresa
    const animal = await this.prisma.animales.findFirst({
      where: { id_animal, empresa_id: empresaId },
    });
    if (!animal) {
      throw new NotFoundException('Animal no encontrado');
    }

    const data: Record<string, unknown> = {
      empresa_id: empresaId,
      id_finca,
      id_animal,
      fecha_hora: new Date(dto.fecha_hora),
      observaciones: dto.observaciones ?? null,
    };

    if (dto.lote_origen_id) {
      data.lote_origen_id = parseBigInt(dto.lote_origen_id, 'lote_origen_id');
    }
    if (dto.lote_destino_id) {
      data.lote_destino_id = parseBigInt(
        dto.lote_destino_id,
        'lote_destino_id',
      );
    }
    if (dto.potrero_origen_id) {
      data.potrero_origen_id = parseBigInt(
        dto.potrero_origen_id,
        'potrero_origen_id',
      );
    }
    if (dto.potrero_destino_id) {
      data.potrero_destino_id = parseBigInt(
        dto.potrero_destino_id,
        'potrero_destino_id',
      );
    }
    if (dto.id_motivo_movimiento) {
      data.id_motivo_movimiento = parseBigInt(
        dto.id_motivo_movimiento,
        'id_motivo_movimiento',
      );
    }

    const movimiento = await this.prisma.movimientos_animales.create({
      data: data as Parameters<
        typeof this.prisma.movimientos_animales.create
      >[0]['data'],
      include: {
        animales: { select: { nombre: true, id_animal: true } },
        motivos_movimiento: { select: { nombre: true } },
      },
    });

    return this.mapMovimiento(movimiento);
  }

  async update(empresaId: bigint, id: bigint, dto: UpdateMovimientoDto) {
    const existing = await this.prisma.movimientos_animales.findFirst({
      where: { id_movimiento: id, empresa_id: empresaId },
    });

    if (!existing) {
      throw new NotFoundException('Movimiento no encontrado');
    }

    const data: Record<string, unknown> = {};

    if (dto.fecha_hora !== undefined) {
      data.fecha_hora = new Date(dto.fecha_hora);
    }
    if (dto.observaciones !== undefined) {
      data.observaciones = dto.observaciones;
    }
    if (dto.lote_origen_id !== undefined) {
      data.lote_origen_id = dto.lote_origen_id
        ? parseBigInt(dto.lote_origen_id, 'lote_origen_id')
        : null;
    }
    if (dto.lote_destino_id !== undefined) {
      data.lote_destino_id = dto.lote_destino_id
        ? parseBigInt(dto.lote_destino_id, 'lote_destino_id')
        : null;
    }
    if (dto.potrero_origen_id !== undefined) {
      data.potrero_origen_id = dto.potrero_origen_id
        ? parseBigInt(dto.potrero_origen_id, 'potrero_origen_id')
        : null;
    }
    if (dto.potrero_destino_id !== undefined) {
      data.potrero_destino_id = dto.potrero_destino_id
        ? parseBigInt(dto.potrero_destino_id, 'potrero_destino_id')
        : null;
    }
    if (dto.id_motivo_movimiento !== undefined) {
      data.id_motivo_movimiento = dto.id_motivo_movimiento
        ? parseBigInt(dto.id_motivo_movimiento, 'id_motivo_movimiento')
        : null;
    }

    const movimiento = await this.prisma.movimientos_animales.update({
      where: { id_movimiento: id },
      data,
      include: {
        animales: { select: { nombre: true, id_animal: true } },
        motivos_movimiento: { select: { nombre: true } },
      },
    });

    return this.mapMovimiento(movimiento);
  }

  async remove(empresaId: bigint, id: bigint) {
    const existing = await this.prisma.movimientos_animales.findFirst({
      where: { id_movimiento: id, empresa_id: empresaId },
    });

    if (!existing) {
      throw new NotFoundException('Movimiento no encontrado');
    }

    await this.prisma.movimientos_animales.delete({
      where: { id_movimiento: id },
    });

    return { deleted: true };
  }

  private mapMovimiento(m: Record<string, unknown>) {
    const mov = m as {
      id_movimiento: bigint;
      empresa_id: bigint;
      id_finca: bigint;
      id_animal: bigint;
      fecha_hora: Date;
      lote_origen_id: bigint | null;
      lote_destino_id: bigint | null;
      potrero_origen_id: bigint | null;
      potrero_destino_id: bigint | null;
      id_motivo_movimiento: bigint | null;
      observaciones: string | null;
      animales?: { id_animal: bigint; nombre: string | null };
      motivos_movimiento?: { nombre: string } | null;
      lotes_movimientos_animales_lote_origen_id_empresa_idTolotes?: {
        nombre: string;
      } | null;
      lotes_movimientos_animales_lote_destino_id_empresa_idTolotes?: {
        nombre: string;
      } | null;
      potreros_movimientos_animales_potrero_origen_id_empresa_idTopotreros?: {
        nombre: string;
      } | null;
      potreros_movimientos_animales_potrero_destino_id_empresa_idTopotreros?: {
        nombre: string;
      } | null;
    };

    return {
      id: mov.id_movimiento.toString(),
      empresa_id: mov.empresa_id.toString(),
      id_finca: mov.id_finca.toString(),
      id_animal: mov.id_animal.toString(),
      animal_nombre: mov.animales?.nombre ?? null,
      fecha_hora: mov.fecha_hora,
      lote_origen_id: mov.lote_origen_id?.toString() ?? null,
      lote_origen_nombre:
        mov.lotes_movimientos_animales_lote_origen_id_empresa_idTolotes
          ?.nombre ?? null,
      lote_destino_id: mov.lote_destino_id?.toString() ?? null,
      lote_destino_nombre:
        mov.lotes_movimientos_animales_lote_destino_id_empresa_idTolotes
          ?.nombre ?? null,
      potrero_origen_id: mov.potrero_origen_id?.toString() ?? null,
      potrero_origen_nombre:
        mov.potreros_movimientos_animales_potrero_origen_id_empresa_idTopotreros
          ?.nombre ?? null,
      potrero_destino_id: mov.potrero_destino_id?.toString() ?? null,
      potrero_destino_nombre:
        mov
          .potreros_movimientos_animales_potrero_destino_id_empresa_idTopotreros
          ?.nombre ?? null,
      id_motivo: mov.id_motivo_movimiento?.toString() ?? null,
      motivo_nombre: mov.motivos_movimiento?.nombre ?? null,
      observaciones: mov.observaciones,
    };
  }
}
