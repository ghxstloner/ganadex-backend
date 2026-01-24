import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { parseBigInt } from '../common/utils/parse-bigint';
import {
  parsePaginationFromDto,
  paginatedResponse,
} from '../common/utils/pagination.util';
import { CreateLoteDto } from './dto/create-lote.dto';
import { QueryLoteDto } from './dto/query-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';
import { BulkAssignAnimalsDto } from './dto/bulk-assign-animals.dto';
import { BulkRemoveAnimalsDto } from './dto/bulk-remove-animals.dto';

@Injectable()
export class LotesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(empresaId: bigint, query: QueryLoteDto) {
    const pagination = parsePaginationFromDto(query);

    const where: Record<string, unknown> = { empresa_id: empresaId };

    if (query.id_finca) {
      where.id_finca = parseBigInt(query.id_finca, 'id_finca');
    }
    if (query.solo_activos) {
      where.activo = true;
    }
    if (query.q) {
      where.nombre = { contains: query.q };
    }

    const [data, total] = await Promise.all([
      this.prisma.lotes.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { nombre: 'asc' },
        include: {
          fincas: { select: { nombre: true } },
        },
      }),
      this.prisma.lotes.count({ where }),
    ]);

    const mapped = data.map((l) => this.mapLote(l));
    return paginatedResponse(mapped, total, pagination);
  }

  async findOne(empresaId: bigint, id: bigint) {
    const lote = await this.prisma.lotes.findFirst({
      where: { id_lote: id, empresa_id: empresaId },
      include: { fincas: { select: { nombre: true } } },
    });

    if (!lote) {
      throw new NotFoundException('Lote no encontrado');
    }

    return this.mapLote(lote);
  }

  async create(empresaId: bigint, dto: CreateLoteDto) {
    const id_finca = parseBigInt(dto.id_finca, 'id_finca');

    const finca = await this.prisma.fincas.findFirst({
      where: { id_finca, empresa_id: empresaId },
    });
    if (!finca) {
      throw new NotFoundException('Finca no encontrada');
    }

    const lote = await this.prisma.lotes.create({
      data: {
        empresa_id: empresaId,
        id_finca,
        nombre: dto.nombre,
        descripcion: dto.descripcion ?? null,
        activo: dto.activo ?? true,
      },
      include: { fincas: { select: { nombre: true } } },
    });

    return this.mapLote(lote);
  }

  async update(empresaId: bigint, id: bigint, dto: UpdateLoteDto) {
    const existing = await this.prisma.lotes.findFirst({
      where: { id_lote: id, empresa_id: empresaId },
    });

    if (!existing) {
      throw new NotFoundException('Lote no encontrado');
    }

    const data: Record<string, unknown> = {};

    if (dto.nombre !== undefined) data.nombre = dto.nombre;
    if (dto.descripcion !== undefined) data.descripcion = dto.descripcion;
    if (dto.activo !== undefined) data.activo = dto.activo;

    const lote = await this.prisma.lotes.update({
      where: { id_lote_empresa_id: { id_lote: id, empresa_id: empresaId } },
      data,
      include: { fincas: { select: { nombre: true } } },
    });

    return this.mapLote(lote);
  }

  async remove(empresaId: bigint, id: bigint) {
    const existing = await this.prisma.lotes.findFirst({
      where: { id_lote: id, empresa_id: empresaId },
    });

    if (!existing) {
      throw new NotFoundException('Lote no encontrado');
    }

    await this.prisma.lotes.delete({
      where: { id_lote_empresa_id: { id_lote: id, empresa_id: empresaId } },
    });

    return { deleted: true };
  }

  async getAnimales(empresaId: bigint, id: bigint) {
    const lote = await this.prisma.lotes.findFirst({
      where: { id_lote: id, empresa_id: empresaId },
    });

    if (!lote) {
      throw new NotFoundException('Lote no encontrado');
    }

    const animales = await this.prisma.animales.findMany({
      where: {
        empresa_id: empresaId,
        lote_actual_id: id,
      },
      orderBy: { nombre: 'asc' },
      include: {
        razas: { select: { nombre: true } },
        colores_pelaje: { select: { nombre: true } },
        fincas: { select: { nombre: true } },
      },
    });

    return animales.map((a) => this.mapAnimal(a));
  }

  async bulkAssign(empresaId: bigint, id: bigint, dto: BulkAssignAnimalsDto) {
    const lote = await this.prisma.lotes.findFirst({
      where: { id_lote: id, empresa_id: empresaId },
    });

    if (!lote) {
      throw new NotFoundException('Lote no encontrado');
    }

    const animalIds = dto.id_animal.map((animalId) =>
      parseBigInt(animalId, 'id_animal'),
    );

    const animales = await this.prisma.animales.findMany({
      where: {
        empresa_id: empresaId,
        id_animal: { in: animalIds },
      },
      select: { id_animal: true, lote_actual_id: true, id_finca: true },
    });

    const animalesMap = new Map(
      animales.map((animal) => [animal.id_animal.toString(), animal]),
    );

    const failed: { id_animal: string; reason: string }[] = [];
    const validAnimals: {
      id_animal: bigint;
      lote_actual_id: bigint | null;
      id_finca: bigint;
    }[] = [];

    dto.id_animal.forEach((animalId) => {
      const animal = animalesMap.get(animalId);
      if (!animal) {
        failed.push({ id_animal: animalId, reason: 'ANIMAL_NO_ENCONTRADO' });
        return;
      }
      if (animal.id_finca !== lote.id_finca) {
        failed.push({
          id_animal: animalId,
          reason: 'ANIMAL_FUERA_DE_FINCA',
        });
        return;
      }
      if (animal.lote_actual_id === id) {
        failed.push({ id_animal: animalId, reason: 'ANIMAL_YA_EN_LOTE' });
        return;
      }
      validAnimals.push(animal);
    });

    if (!validAnimals.length) {
      return { assigned_count: 0, failed };
    }

    const now = new Date();
    const potreroActualPorAnimal = await this.getPotreroActualPorAnimal(
      empresaId,
      validAnimals.map((animal) => animal.id_animal),
    );

    await this.prisma.$transaction(async (tx) => {
      await tx.animales.updateMany({
        where: {
          empresa_id: empresaId,
          id_animal: { in: validAnimals.map((a) => a.id_animal) },
        },
        data: { lote_actual_id: id },
      });

      await tx.movimientos_animales.createMany({
        data: validAnimals.map((animal) => {
          const potreroActual = potreroActualPorAnimal.get(
            animal.id_animal.toString(),
          );
          return {
            empresa_id: empresaId,
            id_finca: lote.id_finca,
            fecha_hora: now,
            id_animal: animal.id_animal,
            lote_origen_id: animal.lote_actual_id,
            lote_destino_id: id,
            potrero_origen_id: potreroActual ?? null,
            potrero_destino_id: potreroActual ?? null,
            id_motivo_movimiento: null,
            observaciones: 'Asignacion masiva a lote',
            created_by: null,
          };
        }),
      });
    });

    return { assigned_count: validAnimals.length, failed };
  }

  async bulkRemove(empresaId: bigint, id: bigint, dto: BulkRemoveAnimalsDto) {
    const lote = await this.prisma.lotes.findFirst({
      where: { id_lote: id, empresa_id: empresaId },
    });

    if (!lote) {
      throw new NotFoundException('Lote no encontrado');
    }

    const animalIds = dto.id_animal.map((animalId) =>
      parseBigInt(animalId, 'id_animal'),
    );

    const animales = await this.prisma.animales.findMany({
      where: {
        empresa_id: empresaId,
        id_animal: { in: animalIds },
      },
      select: { id_animal: true, lote_actual_id: true, id_finca: true },
    });

    const animalesMap = new Map(
      animales.map((animal) => [animal.id_animal.toString(), animal]),
    );

    const failed: { id_animal: string; reason: string }[] = [];
    const validAnimals: {
      id_animal: bigint;
      lote_actual_id: bigint | null;
      id_finca: bigint;
    }[] = [];

    dto.id_animal.forEach((animalId) => {
      const animal = animalesMap.get(animalId);
      if (!animal) {
        failed.push({ id_animal: animalId, reason: 'ANIMAL_NO_ENCONTRADO' });
        return;
      }
      if (animal.id_finca !== lote.id_finca) {
        failed.push({
          id_animal: animalId,
          reason: 'ANIMAL_FUERA_DE_FINCA',
        });
        return;
      }
      if (animal.lote_actual_id !== id) {
        failed.push({ id_animal: animalId, reason: 'ANIMAL_NO_EN_LOTE' });
        return;
      }
      validAnimals.push(animal);
    });

    if (!validAnimals.length) {
      return { removed_count: 0, failed };
    }

    const now = new Date();
    const potreroActualPorAnimal = await this.getPotreroActualPorAnimal(
      empresaId,
      validAnimals.map((animal) => animal.id_animal),
    );

    await this.prisma.$transaction(async (tx) => {
      await tx.animales.updateMany({
        where: {
          empresa_id: empresaId,
          id_animal: { in: validAnimals.map((a) => a.id_animal) },
          lote_actual_id: id,
        },
        data: { lote_actual_id: null },
      });

      await tx.movimientos_animales.createMany({
        data: validAnimals.map((animal) => {
          const potreroActual = potreroActualPorAnimal.get(
            animal.id_animal.toString(),
          );
          return {
            empresa_id: empresaId,
            id_finca: lote.id_finca,
            fecha_hora: now,
            id_animal: animal.id_animal,
            lote_origen_id: id,
            lote_destino_id: null,
            potrero_origen_id: potreroActual ?? null,
            potrero_destino_id: potreroActual ?? null,
            id_motivo_movimiento: null,
            observaciones: 'Remocion masiva de lote',
            created_by: null,
          };
        }),
      });
    });

    return { removed_count: validAnimals.length, failed };
  }

  private mapLote(l: Record<string, unknown>) {
    const lote = l as {
      id_lote: bigint;
      empresa_id: bigint;
      id_finca: bigint;
      nombre: string;
      descripcion: string | null;
      activo: boolean;
      fincas?: { nombre: string };
    };

    return {
      id: lote.id_lote.toString(),
      empresa_id: lote.empresa_id.toString(),
      id_finca: lote.id_finca.toString(),
      finca_nombre: lote.fincas?.nombre ?? null,
      nombre: lote.nombre,
      descripcion: lote.descripcion,
      activo: lote.activo,
    };
  }

  private mapAnimal(a: Record<string, unknown>) {
    const animal = a as {
      id_animal: bigint;
      empresa_id: bigint;
      id_finca: bigint;
      nombre: string | null;
      codigo: string | null;
      identificador_principal: string | null;
      sexo: string;
      estado: string | null;
      categoria: string | null;
      fecha_nacimiento: Date | null;
      lote_actual_id: bigint | null;
      razas?: { nombre: string } | null;
      colores_pelaje?: { nombre: string } | null;
      fincas?: { nombre: string } | null;
    };

    return {
      id: animal.id_animal.toString(),
      empresa_id: animal.empresa_id.toString(),
      id_finca: animal.id_finca.toString(),
      nombre: animal.nombre,
      codigo: animal.codigo,
      identificador_principal: animal.identificador_principal,
      sexo: animal.sexo,
      estado: animal.estado,
      categoria: animal.categoria,
      fecha_nacimiento: animal.fecha_nacimiento?.toISOString() ?? null,
      lote_actual_id: animal.lote_actual_id?.toString() ?? null,
      raza_nombre: animal.razas?.nombre ?? null,
      color_nombre: animal.colores_pelaje?.nombre ?? null,
      finca_nombre: animal.fincas?.nombre ?? null,
    };
  }

  private async getPotreroActualPorAnimal(
    empresaId: bigint,
    animalIds: bigint[],
  ) {
    if (!animalIds.length) {
      return new Map<string, bigint | null>();
    }

    const rows = await this.prisma.$queryRaw<
      { id_animal: bigint; potrero_actual_id: bigint | null }[]
    >(Prisma.sql`
      SELECT m.id_animal, m.potrero_destino_id as potrero_actual_id
      FROM movimientos_animales m
      INNER JOIN (
        SELECT id_animal, MAX(fecha_hora) AS max_fecha
        FROM movimientos_animales
        WHERE empresa_id = ${empresaId}
          AND id_animal IN (${Prisma.join(animalIds)})
        GROUP BY id_animal
      ) last
        ON last.id_animal = m.id_animal AND last.max_fecha = m.fecha_hora
      WHERE m.empresa_id = ${empresaId}
        AND m.id_animal IN (${Prisma.join(animalIds)})
    `);

    const map = new Map<string, bigint | null>();
    rows.forEach((row) => {
      map.set(row.id_animal.toString(), row.potrero_actual_id);
    });
    return map;
  }
}
