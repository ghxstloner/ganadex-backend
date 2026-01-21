import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import ExcelJS from 'exceljs';
import { PrismaService } from '../prisma/prisma.service';
import { parseBigInt } from '../common/utils/parse-bigint';
import {
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

    const animal = await this.prisma.animales.findFirst({
      where: { id_animal, empresa_id: empresaId },
      select: { id_animal: true, id_finca: true, lote_actual_id: true },
    });
    if (!animal) {
      throw new NotFoundException('Animal no encontrado');
    }

    if (animal.id_finca !== id_finca) {
      throw new BadRequestException('El animal no pertenece a la finca');
    }

    if (dto.lote_origen_id && animal.lote_actual_id !== null) {
      const requestedOrigen = parseBigInt(dto.lote_origen_id, 'lote_origen_id');
      if (animal.lote_actual_id !== requestedOrigen) {
        throw new BadRequestException(
          'El lote origen no coincide con el animal',
        );
      }
    }

    const lote_origen_id = dto.lote_origen_id
      ? parseBigInt(dto.lote_origen_id, 'lote_origen_id')
      : (animal.lote_actual_id ?? null);
    const lote_destino_id = dto.lote_destino_id
      ? parseBigInt(dto.lote_destino_id, 'lote_destino_id')
      : null;

    if (!lote_destino_id) {
      throw new BadRequestException('Debe especificar un lote de destino');
    }

    const loteDestino = await this.prisma.lotes.findFirst({
      where: { id_lote: lote_destino_id, empresa_id: empresaId },
      select: { id_lote: true, id_finca: true },
    });

    if (!loteDestino) {
      throw new NotFoundException('Lote destino no encontrado');
    }

    if (loteDestino.id_finca !== id_finca) {
      throw new BadRequestException('El lote destino no pertenece a la finca');
    }

    if (lote_origen_id && lote_origen_id === lote_destino_id) {
      throw new BadRequestException('El animal ya pertenece al lote destino');
    }

    const fecha_hora = new Date(dto.fecha_hora);

    const movimiento = await this.prisma.$transaction(async (tx) => {
      await tx.animales.update({
        where: {
          id_animal_empresa_id: { id_animal: id_animal, empresa_id: empresaId },
        },
        data: { lote_actual_id: lote_destino_id },
      });

      return tx.movimientos_animales.create({
        data: {
          empresa_id: empresaId,
          id_finca,
          fecha_hora,
          id_animal,
          lote_origen_id,
          lote_destino_id,
          potrero_origen_id: null,
          potrero_destino_id: null,
          id_motivo_movimiento: dto.id_motivo_movimiento
            ? parseBigInt(dto.id_motivo_movimiento, 'id_motivo_movimiento')
            : null,
          observaciones: dto.observaciones ?? null,
          created_by: null,
        } as Parameters<typeof tx.movimientos_animales.create>[0]['data'],
        include: {
          animales: { select: { nombre: true, id_animal: true } },
          motivos_movimiento: { select: { nombre: true } },
        },
      });
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

  async getMotivos(empresaId: bigint) {
    const motivos = await this.prisma.motivos_movimiento.findMany({
      where: {
        OR: [{ empresa_id: empresaId }, { empresa_id: null }],
      },
      orderBy: { nombre: 'asc' },
      select: {
        id_motivo_movimiento: true,
        codigo: true,
        nombre: true,
      },
    });

    return motivos.map((m) => ({
      id: m.id_motivo_movimiento.toString(),
      codigo: m.codigo,
      nombre: m.nombre,
    }));
  }

  async exportExcel(empresaId: bigint, query: QueryMovimientoDto) {
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

    const movimientos = await this.prisma.movimientos_animales.findMany({
      where,
      orderBy: { fecha_hora: 'desc' },
      include: {
        animales: { select: { nombre: true, id_animal: true } },
        motivos_movimiento: { select: { nombre: true } },
        usuarios: { select: { nombre: true } },
        lotes_movimientos_animales_lote_origen_id_empresa_idTolotes: {
          select: { nombre: true },
        },
        lotes_movimientos_animales_lote_destino_id_empresa_idTolotes: {
          select: { nombre: true },
        },
      },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Movimientos');

    sheet.columns = [
      { header: 'Fecha', key: 'fecha', width: 14 },
      { header: 'Animal', key: 'animal', width: 30 },
      { header: 'Lote Origen', key: 'lote_origen', width: 22 },
      { header: 'Lote Destino', key: 'lote_destino', width: 22 },
      { header: 'Motivo', key: 'motivo', width: 24 },
      { header: 'Usuario', key: 'usuario', width: 22 },
    ];

    movimientos.forEach((movimiento) => {
      const fecha = new Date(movimiento.fecha_hora);
      sheet.addRow({
        fecha,
        animal: movimiento.animales?.nombre ?? movimiento.id_animal.toString(),
        lote_origen:
          movimiento.lotes_movimientos_animales_lote_origen_id_empresa_idTolotes
            ?.nombre ?? '',
        lote_destino:
          movimiento
            .lotes_movimientos_animales_lote_destino_id_empresa_idTolotes
            ?.nombre ?? '',
        motivo: movimiento.motivos_movimiento?.nombre ?? '',
        usuario: movimiento.usuarios?.nombre ?? 'Sin usuario',
      });
    });

    sheet.getColumn('fecha').numFmt = 'dd/mm/yyyy';

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  async buildTemplate() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Movimientos');

    sheet.columns = [
      { header: 'Animal', key: 'animal', width: 30 },
      { header: 'Lote Destino', key: 'lote_destino', width: 22 },
      { header: 'Fecha', key: 'fecha', width: 14 },
      { header: 'Motivo', key: 'motivo', width: 24 },
    ];

    sheet.getColumn('fecha').numFmt = 'dd/mm/yyyy';

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  private normalizeCellValue(value: ExcelJS.CellValue | undefined) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'object') {
      if ('text' in value && typeof value.text === 'string') {
        return value.text.trim();
      }
    }
    return '';
  }

  private parseExcelDate(value: ExcelJS.CellValue | undefined) {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === 'number') {
      return new Date(Math.round((value - 25569) * 86400 * 1000));
    }
    if (typeof value === 'string') {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    return null;
  }

  async importExcel(empresaId: bigint, fileBuffer: Buffer) {
    const workbook = new ExcelJS.Workbook();
    
    // CORRECCIÓN: Usamos 'as any' aquí.
    // Esto soluciona el conflicto de tipos entre @types/node y exceljs.
    // El objeto fileBuffer ES válido, solo que TypeScript se confunde con la definición.
    await workbook.xlsx.load(fileBuffer as any);

    const sheet = workbook.getWorksheet('Movimientos');
    if (!sheet) {
      throw new BadRequestException('La hoja "Movimientos" no existe');
    }

    const headerRow = sheet.getRow(1);
    const headerValues = Array.isArray(headerRow.values)
      ? (headerRow.values as ExcelJS.CellValue[])
      : [];
    const headers = headerValues
      .slice(1)
      .map((value) => this.normalizeCellValue(value));

    const requiredHeaders = ['Animal', 'Lote Destino'];
    const headerMap = new Map<string, number>();

    headers.forEach((header, index) => {
      if (typeof header === 'string' && header) {
        headerMap.set(this.normalizeKey(header), index + 1);
      }
    });

    requiredHeaders.forEach((header) => {
      if (!headerMap.has(this.normalizeKey(header))) {
        throw new BadRequestException(`Falta la columna "${header}"`);
      }
    });

    const fechaColumn = headerMap.get(this.normalizeKey('Fecha'));
    const motivoColumn = headerMap.get(this.normalizeKey('Motivo'));

    const errors: { row: number; message: string }[] = [];
    let processed = 0;
    let created = 0;

    for (let i = 2; i <= sheet.rowCount; i += 1) {
      const row = sheet.getRow(i);
      if (!row || row.actualCellCount === 0) {
        continue;
      }

      const animalValue = this.normalizeCellValue(
        row.getCell(headerMap.get(this.normalizeKey('Animal')) ?? 0).value,
      );
      const loteDestinoValue = this.normalizeCellValue(
        row.getCell(headerMap.get(this.normalizeKey('Lote Destino')) ?? 0)
          .value,
      );
      const fechaValue = fechaColumn ? row.getCell(fechaColumn).value : null;
      const motivoValue = motivoColumn
        ? this.normalizeCellValue(row.getCell(motivoColumn).value)
        : '';

      if (!animalValue) {
        errors.push({ row: i, message: 'Animal requerido' });
        continue;
      }
      if (!loteDestinoValue) {
        errors.push({ row: i, message: 'Lote destino requerido' });
        continue;
      }

      processed += 1;

      try {
        const fecha = this.parseExcelDate(fechaValue) ?? new Date();
        const movimiento = await this.buildMovimientoFromImport(
          empresaId,
          animalValue,
          loteDestinoValue,
          fecha,
          motivoValue,
        );

        await this.prisma.$transaction(async (tx) => {
          if (!movimiento.id_animal) {
            throw new BadRequestException('Animal no encontrado');
          }
          await tx.animales.update({
            where: {
              id_animal_empresa_id: {
                id_animal: movimiento.id_animal,
                empresa_id: empresaId,
              },
            },
            data: { lote_actual_id: movimiento.lote_destino_id },
          });

          await tx.movimientos_animales.create({
            data: movimiento,
          });
        });

        created += 1;
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Error procesando fila';
        errors.push({ row: i, message });
      }
    }

    return {
      processed,
      created,
      errors,
    };
  }

  private async buildMovimientoFromImport(
    empresaId: bigint,
    animalValue: string,
    loteDestinoValue: string,
    fecha: Date,
    motivoValue: string,
  ) {
    const animalId = this.parseAnimalIdentifier(animalValue);
    const loteId = this.parseLoteIdentifier(loteDestinoValue);

    const [animal, loteDestino] = await Promise.all([
      animalId
        ? this.prisma.animales.findFirst({
            where: { empresa_id: empresaId, id_animal: animalId },
            select: { id_animal: true, id_finca: true, lote_actual_id: true },
          })
        : Promise.resolve(null),
      loteId
        ? this.prisma.lotes.findFirst({
            where: { empresa_id: empresaId, id_lote: loteId },
            select: { id_lote: true, id_finca: true },
          })
        : Promise.resolve(null),
    ]);

    const resolvedAnimal =
      animal ?? (await this.findAnimalByIdentifier(empresaId, animalValue));

    if (!resolvedAnimal) {
      throw new BadRequestException('Animal no encontrado');
    }

    const resolvedLote =
      loteDestino ?? (await this.findLoteByName(empresaId, loteDestinoValue));

    if (!resolvedLote) {
      throw new BadRequestException('Lote destino no encontrado');
    }

    if (resolvedLote.id_finca !== resolvedAnimal.id_finca) {
      throw new BadRequestException('Lote destino fuera de la finca');
    }

    return {
      empresa_id: empresaId,
      id_finca: resolvedAnimal.id_finca,
      fecha_hora: fecha,
      id_animal: resolvedAnimal.id_animal,
      lote_origen_id: resolvedAnimal.lote_actual_id,
      lote_destino_id: resolvedLote.id_lote,
      potrero_origen_id: null,
      potrero_destino_id: null,
      id_motivo_movimiento: await this.resolveMotivoId(empresaId, motivoValue),
      observaciones: 'Importacion de movimientos',
      created_by: null,
    } as Parameters<typeof this.prisma.movimientos_animales.create>[0]['data'];
  }

  private async findAnimalByIdentifier(empresaId: bigint, value: string) {
    const ident = await this.prisma.animal_identificaciones.findFirst({
      where: {
        empresa_id: empresaId,
        valor: value,
        activo: true,
      },
      select: { id_animal: true },
    });

    if (!ident) {
      return null;
    }

    return this.prisma.animales.findFirst({
      where: { empresa_id: empresaId, id_animal: ident.id_animal },
      select: { id_animal: true, id_finca: true, lote_actual_id: true },
    });
  }

  private async findLoteByName(empresaId: bigint, value: string) {
    const normalizedValue = value.trim().toLowerCase();
    const lotes = await this.prisma.lotes.findMany({
      where: {
        empresa_id: empresaId,
      },
      select: { id_lote: true, id_finca: true, nombre: true },
    });
    return lotes.find(
      (lote) => lote.nombre?.trim().toLowerCase() === normalizedValue,
    ) ?? null;
  }

  private parseAnimalIdentifier(value: string) {
    if (/^\d+$/.test(value)) {
      return parseBigInt(value, 'animal_id');
    }
    return null;
  }

  private parseLoteIdentifier(value: string) {
    if (/^\d+$/.test(value)) {
      return parseBigInt(value, 'lote_id');
    }
    return null;
  }

  private normalizeKey(value: string) {
    return value.trim().toLowerCase();
  }

  private async resolveMotivoId(empresaId: bigint, motivoValue: string) {
    if (!motivoValue) {
      return null;
    }
    const normalizedValue = motivoValue.trim().toLowerCase();
    const motivos = await this.prisma.motivos_movimiento.findMany({
      where: {
        OR: [{ empresa_id: empresaId }, { empresa_id: null }],
      },
      select: { id_motivo_movimiento: true, codigo: true, nombre: true },
    });
    const motivo = motivos.find(
      (m) =>
        m.codigo?.trim().toLowerCase() === normalizedValue ||
        m.nombre?.trim().toLowerCase() === normalizedValue,
    );

    if (!motivo) {
      throw new BadRequestException('Motivo no encontrado');
    }
    return motivo.id_motivo_movimiento;
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
