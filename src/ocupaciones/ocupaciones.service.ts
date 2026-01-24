import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { parseBigInt } from '../common/utils/parse-bigint';
import {
  parsePaginationFromDto,
  paginatedResponse,
} from '../common/utils/pagination.util';
import { CreateOcupacionDto } from './dto/create-ocupacion.dto';
import { CloseOcupacionDto } from './dto/close-ocupacion.dto';
import { CloseOcupacionBodyDto } from './dto/close-ocupacion-body.dto';
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

  async getHistorial(empresaId: bigint, query: ListOcupacionesDto) {
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

    const ocupaciones = await this.prisma.ocupacion_potreros.findMany({
      where,
      orderBy: { fecha_inicio: 'desc' },
      include: {
        fincas: { select: { nombre: true } },
        potreros: { select: { nombre: true } },
        lotes: { select: { nombre: true } },
      },
    });

    return ocupaciones.map((o) => this.mapOcupacion(o));
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

    try {
      const ocupacion = await this.prisma.ocupacion_potreros.create({
        data: {
          empresa_id: empresaId,
          id_finca,
          id_potrero,
          id_lote,
          fecha_inicio,
          fecha_fin: null,
          is_active: true,
          notas: dto.notas ?? null,
        },
        include: {
          fincas: { select: { nombre: true } },
          potreros: { select: { nombre: true } },
          lotes: { select: { nombre: true } },
        },
      });

      return this.mapOcupacion(ocupacion);
    } catch (error) {
      const prismaError = error as {
        code?: string;
        meta?: { target?: string[] };
      };
      if (prismaError.code === 'P2002') {
        const target = prismaError.meta?.target ?? [];
        if (target.includes('uq_op_potrero_lote_activa')) {
          throw new ConflictException(
            `El lote "${lote.nombre}" ya tiene una ocupación activa en este potrero`,
          );
        }
        throw new ConflictException('Ya existe una ocupación activa');
      }
      throw error;
    }
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

    const fecha_fin = dto.fecha_fin ? new Date(dto.fecha_fin) : new Date();

    if (fecha_fin < ocupacion.fecha_inicio) {
      throw new BadRequestException(
        'La fecha de fin debe ser mayor o igual a la fecha de inicio',
      );
    }

    const updated = await this.prisma.ocupacion_potreros.update({
      where: { id_ocupacion: id },
      data: {
        fecha_fin,
        is_active: false,
        notas: dto.notas !== undefined ? dto.notas : ocupacion.notas,
      },
      include: {
        fincas: { select: { nombre: true } },
        potreros: { select: { nombre: true } },
        lotes: { select: { nombre: true } },
      },
    });

    const warning = await this.buildWarningAnimalesEnPotrero(
      empresaId,
      updated.id_potrero,
      updated.id_lote,
      updated.id_finca,
    );

    return {
      ocupacion: this.mapOcupacion(updated),
      warning,
    };
  }

  async cerrarByBody(empresaId: bigint, dto: CloseOcupacionBodyDto) {
    const idOcupacion = dto.id_ocupacion
      ? parseBigInt(dto.id_ocupacion, 'id_ocupacion')
      : null;
    const idPotrero = dto.id_potrero
      ? parseBigInt(dto.id_potrero, 'id_potrero')
      : null;
    const idLote = dto.id_lote ? parseBigInt(dto.id_lote, 'id_lote') : null;

    if (!idOcupacion && (!idPotrero || !idLote)) {
      throw new BadRequestException(
        'Debe indicar id_ocupacion o id_potrero + id_lote',
      );
    }

    const ocupacion = await this.prisma.ocupacion_potreros.findFirst({
      where: {
        empresa_id: empresaId,
        ...(idOcupacion
          ? { id_ocupacion: idOcupacion }
          : {
              id_potrero: idPotrero,
              id_lote: idLote,
              fecha_fin: null,
            }),
      },
    });

    if (!ocupacion) {
      throw new NotFoundException('Ocupación no encontrada');
    }

    return this.cerrar(empresaId, ocupacion.id_ocupacion, {
      fecha_fin: dto.fecha_fin,
      notas: dto.notas,
    });
  }

  async getActivas(empresaId: bigint, id_finca?: string, vista?: string) {
    const view = vista?.trim().toLowerCase() ?? 'potrero';
    if (view !== 'potrero' && view !== 'lote') {
      throw new BadRequestException('Vista inválida');
    }

    const where: Record<string, unknown> = {
      empresa_id: empresaId,
      fecha_fin: null,
      is_active: true,
    };

    const fincaId = id_finca ? parseBigInt(id_finca, 'id_finca') : null;
    if (fincaId) {
      where.id_finca = fincaId;
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

    const animalesUbicacion = await this.getAnimalesUbicacionActual(
      empresaId,
      fincaId,
    );

    const potreroStats = new Map<
      string,
      {
        total: number;
        lotes: Map<string, number>;
        lotesActuales: (string | null)[];
      }
    >();

    animalesUbicacion.forEach((row) => {
      if (!row.potrero_id) return;
      const potreroId = row.potrero_id.toString();
      const loteId = row.lote_actual_id ? row.lote_actual_id.toString() : null;

      const stats = potreroStats.get(potreroId) ?? {
        total: 0,
        lotes: new Map(),
        lotesActuales: [],
      };
      stats.total += 1;
      stats.lotesActuales.push(loteId);
      if (loteId) {
        stats.lotes.set(loteId, (stats.lotes.get(loteId) ?? 0) + 1);
      }
      potreroStats.set(potreroId, stats);
    });

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const potreroMap = new Map<
      string,
      {
        potrero_id: string;
        potrero_nombre: string;
        finca_id: string;
        finca_nombre: string;
        ocupaciones: {
          id_ocupacion: string;
          lote_id: string;
          lote_nombre: string;
          fecha_inicio: Date;
          dias: number;
          animales_del_lote: number;
        }[];
      }
    >();

    ocupaciones.forEach((o) => {
      const potreroId = o.id_potrero.toString();
      const loteId = o.id_lote.toString();
      const fechaInicio = new Date(o.fecha_inicio);
      fechaInicio.setHours(0, 0, 0, 0);
      const dias = Math.floor(
        (hoy.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24),
      );

      const stats = potreroStats.get(potreroId);
      const animales_del_lote = stats?.lotes.get(loteId) ?? 0;

      const existing = potreroMap.get(potreroId) ?? {
        potrero_id: potreroId,
        potrero_nombre: o.potreros.nombre,
        finca_id: o.id_finca.toString(),
        finca_nombre: o.fincas.nombre,
        ocupaciones: [],
      };

      existing.ocupaciones.push({
        id_ocupacion: o.id_ocupacion.toString(),
        lote_id: loteId,
        lote_nombre: o.lotes.nombre,
        fecha_inicio: o.fecha_inicio,
        dias,
        animales_del_lote,
      });

      potreroMap.set(potreroId, existing);
    });

    const porPotrero = Array.from(potreroMap.values()).map((potrero) => {
      const stats = potreroStats.get(potrero.potrero_id);
      const expectedLotes = new Set(
        potrero.ocupaciones.map((o) => o.lote_id),
      );
      const mezcla_indebida =
        stats?.lotesActuales.some(
          (loteId) => !loteId || !expectedLotes.has(loteId),
        ) ?? false;

      return {
        ...potrero,
        animales_presentes: stats?.total ?? 0,
        mezcla_indebida,
      };
    });

    const loteMap = new Map<
      string,
      {
        lote_id: string;
        lote_nombre: string;
        finca_id: string;
        finca_nombre: string;
        ocupaciones: {
          id_ocupacion: string;
          potrero_id: string;
          potrero_nombre: string;
          fecha_inicio: Date;
          dias: number;
          animales_del_lote: number;
          animales_presentes: number;
          mezcla_indebida: boolean;
        }[];
      }
    >();

    porPotrero.forEach((potrero) => {
      potrero.ocupaciones.forEach((ocupacion) => {
        const existing = loteMap.get(ocupacion.lote_id) ?? {
          lote_id: ocupacion.lote_id,
          lote_nombre: ocupacion.lote_nombre,
          finca_id: potrero.finca_id,
          finca_nombre: potrero.finca_nombre,
          ocupaciones: [],
        };

        existing.ocupaciones.push({
          id_ocupacion: ocupacion.id_ocupacion,
          potrero_id: potrero.potrero_id,
          potrero_nombre: potrero.potrero_nombre,
          fecha_inicio: ocupacion.fecha_inicio,
          dias: ocupacion.dias,
          animales_del_lote: ocupacion.animales_del_lote,
          animales_presentes: potrero.animales_presentes,
          mezcla_indebida: potrero.mezcla_indebida,
        });

        loteMap.set(ocupacion.lote_id, existing);
      });
    });

    return view === 'lote'
      ? { vista: 'lote', porLote: Array.from(loteMap.values()) }
      : { vista: 'potrero', porPotrero };
  }

  async getResumenActual(
    empresaId: bigint,
    id_finca?: string,
    search?: string,
  ) {
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

  private async buildWarningAnimalesEnPotrero(
    empresaId: bigint,
    potreroId: bigint,
    loteId: bigint,
    fincaId: bigint,
  ) {
    const animalesUbicacion = await this.getAnimalesUbicacionActual(
      empresaId,
      fincaId,
    );
    const animalesEnPotrero = animalesUbicacion.filter(
      (row) =>
        row.potrero_id?.toString() === potreroId.toString() &&
        row.lote_actual_id?.toString() === loteId.toString(),
    );

    if (!animalesEnPotrero.length) {
      return null;
    }

    return {
      animales_en_potrero: animalesEnPotrero.length,
    };
  }

  private async getAnimalesUbicacionActual(
    empresaId: bigint,
    fincaId?: bigint | null,
  ) {
    const fincaFilterSub = fincaId
      ? Prisma.sql`AND id_finca = ${fincaId}`
      : Prisma.sql``;
    const fincaFilterOuter = fincaId
      ? Prisma.sql`AND m.id_finca = ${fincaId}`
      : Prisma.sql``;

    return this.prisma.$queryRaw<
      { id_animal: bigint; potrero_id: bigint | null; lote_actual_id: bigint | null }[]
    >(Prisma.sql`
      SELECT m.id_animal, m.potrero_destino_id as potrero_id, a.lote_actual_id as lote_actual_id
      FROM movimientos_animales m
      INNER JOIN (
        SELECT id_animal, MAX(fecha_hora) AS max_fecha
        FROM movimientos_animales
        WHERE empresa_id = ${empresaId}
        ${fincaFilterSub}
        GROUP BY id_animal
      ) last
        ON last.id_animal = m.id_animal AND last.max_fecha = m.fecha_hora
      INNER JOIN animales a
        ON a.id_animal = m.id_animal AND a.empresa_id = m.empresa_id
      WHERE m.empresa_id = ${empresaId}
        ${fincaFilterOuter}
        AND m.potrero_destino_id IS NOT NULL
    `);
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
      is_active?: boolean | null;
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
      activo: ocupacion.is_active ?? ocupacion.fecha_fin === null,
      notas: ocupacion.notas,
    };
  }
}
