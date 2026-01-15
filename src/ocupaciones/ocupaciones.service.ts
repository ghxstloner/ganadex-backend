import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { parseBigInt } from '../common/utils/parse-bigint';
import {
  parsePaginationFromDto,
  paginatedResponse,
} from '../common/utils/pagination.util';
import { CreateOcupacionDto } from './dto/create-ocupacion.dto';
import { CloseOcupacionDto } from './dto/close-ocupacion.dto';
import { ListOcupacionesDto } from './dto/list-ocupaciones.dto';

@Injectable()
export class OcupacionesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(empresaId: bigint, query: ListOcupacionesDto) {
    const pagination = parsePaginationFromDto(query);

    const where: Record<string, unknown> = { empresa_id: empresaId };

    if (query.id_finca) {
      where.id_finca = parseBigInt(query.id_finca, 'id_finca');
    }
    if (query.id_potrero) {
      where.id_potrero = parseBigInt(query.id_potrero, 'id_potrero');
    }
    if (query.id_lote) {
      where.id_lote = parseBigInt(query.id_lote, 'id_lote');
    }
    if (query.activo !== undefined) {
      if (query.activo) {
        where.fecha_fin = null;
      } else {
        where.fecha_fin = { not: null };
      }
    }
    if (query.desde || query.hasta) {
      where.fecha_inicio = {};
      if (query.desde) {
        (where.fecha_inicio as Record<string, unknown>).gte = new Date(
          query.desde,
        );
      }
      if (query.hasta) {
        (where.fecha_inicio as Record<string, unknown>).lte = new Date(
          query.hasta,
        );
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.ocupacion_potreros.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { fecha_inicio: 'desc' },
        include: {
          fincas: { select: { nombre: true } },
          potreros: { select: { nombre: true } },
          lotes: { select: { nombre: true } },
        },
      }),
      this.prisma.ocupacion_potreros.count({ where }),
    ]);

    const mapped = data.map((o) => this.mapOcupacion(o));
    return paginatedResponse(mapped, total, pagination);
  }

  async findOne(empresaId: bigint, id: bigint) {
    const ocupacion = await this.prisma.ocupacion_potreros.findFirst({
      where: { id_ocupacion: id, empresa_id: empresaId },
      include: {
        fincas: { select: { nombre: true } },
        potreros: { select: { nombre: true } },
        lotes: { select: { nombre: true } },
      },
    });

    if (!ocupacion) {
      throw new NotFoundException('Ocupación no encontrada');
    }

    return this.mapOcupacion(ocupacion);
  }

  async create(empresaId: bigint, dto: CreateOcupacionDto) {
    const id_finca = parseBigInt(dto.id_finca, 'id_finca');
    const id_potrero = parseBigInt(dto.id_potrero, 'id_potrero');
    const id_lote = parseBigInt(dto.id_lote, 'id_lote');
    const fecha_inicio = new Date(dto.fecha_inicio);

    // Verificar que finca, potrero y lote pertenezcan a la empresa
    const [finca, potrero, lote] = await Promise.all([
      this.prisma.fincas.findFirst({
        where: { id_finca, empresa_id: empresaId },
      }),
      this.prisma.potreros.findFirst({
        where: { id_potrero, empresa_id: empresaId },
      }),
      this.prisma.lotes.findFirst({
        where: { id_lote, empresa_id: empresaId },
      }),
    ]);

    if (!finca) {
      throw new NotFoundException('Finca no encontrada');
    }
    if (!potrero) {
      throw new NotFoundException('Potrero no encontrado');
    }
    if (!lote) {
      throw new NotFoundException('Lote no encontrado');
    }

    // Verificar que potrero y finca coincidan
    if (potrero.id_finca !== id_finca) {
      throw new BadRequestException(
        'El potrero no pertenece a la finca seleccionada',
      );
    }

    // Verificar que lote y finca coincidan
    if (lote.id_finca !== id_finca) {
      throw new BadRequestException(
        'El lote no pertenece a la finca seleccionada',
      );
    }

    // Usar transacción para evitar race conditions
    return await this.prisma.$transaction(async (tx) => {
      // Verificar que NO exista ocupación activa para ese potrero
      const ocupacionPotreroActiva =
        await tx.ocupacion_potreros.findFirst({
          where: {
            empresa_id: empresaId,
            id_potrero,
            fecha_fin: null,
          },
        });

      if (ocupacionPotreroActiva) {
        throw new BadRequestException(
          `El potrero "${potrero.nombre}" ya tiene una ocupación activa. Debe cerrar la ocupación actual antes de crear una nueva.`,
        );
      }

      // Verificar que NO exista ocupación activa para ese lote
      const ocupacionLoteActiva = await tx.ocupacion_potreros.findFirst({
        where: {
          empresa_id: empresaId,
          id_lote,
          fecha_fin: null,
        },
      });

      if (ocupacionLoteActiva) {
        throw new BadRequestException(
          `El lote "${lote.nombre}" ya está ocupado en otro potrero. Debe cerrar la ocupación actual antes de crear una nueva.`,
        );
      }

      // Crear la ocupación
      const ocupacion = await tx.ocupacion_potreros.create({
        data: {
          empresa_id: empresaId,
          id_finca,
          id_potrero,
          id_lote,
          fecha_inicio,
          fecha_fin: null,
          notas: dto.notas ?? null,
        },
        include: {
          fincas: { select: { nombre: true } },
          potreros: { select: { nombre: true } },
          lotes: { select: { nombre: true } },
        },
      });

      return this.mapOcupacion(ocupacion);
    });
  }

  async cerrar(empresaId: bigint, id: bigint, dto: CloseOcupacionDto) {
    const ocupacion = await this.prisma.ocupacion_potreros.findFirst({
      where: { id_ocupacion: id, empresa_id: empresaId },
    });

    if (!ocupacion) {
      throw new NotFoundException('Ocupación no encontrada');
    }

    if (ocupacion.fecha_fin !== null) {
      throw new BadRequestException('La ocupación ya está cerrada');
    }

    const fecha_fin = new Date(dto.fecha_fin);

    if (fecha_fin < ocupacion.fecha_inicio) {
      throw new BadRequestException(
        'La fecha de fin debe ser mayor o igual a la fecha de inicio',
      );
    }

    const updated = await this.prisma.ocupacion_potreros.update({
      where: { id_ocupacion: id },
      data: {
        fecha_fin,
        notas: dto.notas !== undefined ? dto.notas : ocupacion.notas,
      },
      include: {
        fincas: { select: { nombre: true } },
        potreros: { select: { nombre: true } },
        lotes: { select: { nombre: true } },
      },
    });

    return this.mapOcupacion(updated);
  }

  async getResumenActual(empresaId: bigint, id_finca?: string, search?: string) {
    const where: Record<string, unknown> = {
      empresa_id: empresaId,
      fecha_fin: null, // Solo ocupaciones activas
    };

    if (id_finca) {
      where.id_finca = parseBigInt(id_finca, 'id_finca');
    }

    const ocupaciones = await this.prisma.ocupacion_potreros.findMany({
      where,
      include: {
        fincas: { select: { nombre: true, id_finca: true } },
        potreros: { select: { nombre: true, id_potrero: true } },
        lotes: { select: { nombre: true, id_lote: true } },
      },
      orderBy: { fecha_inicio: 'asc' },
    });

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const porPotrero = ocupaciones.map((o) => {
      const fechaInicio = new Date(o.fecha_inicio);
      fechaInicio.setHours(0, 0, 0, 0);
      const dias = Math.floor(
        (hoy.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24),
      );

      return {
        potrero_id: o.id_potrero.toString(),
        potrero_nombre: o.potreros.nombre,
        finca_id: o.id_finca.toString(),
        finca_nombre: o.fincas.nombre,
        lote_id: o.id_lote.toString(),
        lote_nombre: o.lotes.nombre,
        fecha_inicio: o.fecha_inicio,
        dias,
      };
    });

    const porLote = ocupaciones.map((o) => {
      const fechaInicio = new Date(o.fecha_inicio);
      fechaInicio.setHours(0, 0, 0, 0);
      const dias = Math.floor(
        (hoy.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24),
      );

      return {
        lote_id: o.id_lote.toString(),
        lote_nombre: o.lotes.nombre,
        finca_id: o.id_finca.toString(),
        finca_nombre: o.fincas.nombre,
        potrero_id: o.id_potrero.toString(),
        potrero_nombre: o.potreros.nombre,
        fecha_inicio: o.fecha_inicio,
        dias,
      };
    });

    // Filtrar por búsqueda si se proporciona
    let porPotreroFiltrado = porPotrero;
    let porLoteFiltrado = porLote;

    if (search && search.trim()) {
      const searchLower = search.toLowerCase();
      porPotreroFiltrado = porPotrero.filter(
        (p) =>
          p.potrero_nombre.toLowerCase().includes(searchLower) ||
          p.lote_nombre.toLowerCase().includes(searchLower),
      );
      porLoteFiltrado = porLote.filter(
        (l) =>
          l.lote_nombre.toLowerCase().includes(searchLower) ||
          l.potrero_nombre.toLowerCase().includes(searchLower),
      );
    }

    return {
      porPotrero: porPotreroFiltrado,
      porLote: porLoteFiltrado,
    };
  }

  private mapOcupacion(o: Record<string, unknown>) {
    const ocupacion = o as {
      id_ocupacion: bigint;
      empresa_id: bigint;
      id_finca: bigint;
      id_potrero: bigint;
      id_lote: bigint;
      fecha_inicio: Date;
      fecha_fin: Date | null;
      notas: string | null;
      fincas?: { nombre: string };
      potreros?: { nombre: string };
      lotes?: { nombre: string };
    };

    return {
      id: ocupacion.id_ocupacion.toString(),
      empresa_id: ocupacion.empresa_id.toString(),
      id_finca: ocupacion.id_finca.toString(),
      finca_nombre: ocupacion.fincas?.nombre ?? null,
      id_potrero: ocupacion.id_potrero.toString(),
      potrero_nombre: ocupacion.potreros?.nombre ?? null,
      id_lote: ocupacion.id_lote.toString(),
      lote_nombre: ocupacion.lotes?.nombre ?? null,
      fecha_inicio: ocupacion.fecha_inicio,
      fecha_fin: ocupacion.fecha_fin,
      activo: ocupacion.fecha_fin === null,
      notas: ocupacion.notas,
    };
  }
}
