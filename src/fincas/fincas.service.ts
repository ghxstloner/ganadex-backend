import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { parseBigInt } from '../common/utils/parse-bigint';
import { PrismaService } from '../prisma/prisma.service';
import { TenancyService } from '../tenancy/tenancy.service';
import { FincaCreateDto } from './dto/finca-create.dto';
import { FincaListDto } from './dto/finca-list.dto';
import {
  parsePaginationFromDto,
  paginatedResponse,
} from '../common/utils/pagination.util';
import { FincaUpdateDto } from './dto/finca-update.dto';

@Injectable()
export class FincasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenancyService: TenancyService,
  ) {}

  async list(userId: bigint, query: FincaListDto) {
    const activeEmpresaId =
      await this.tenancyService.requireActiveEmpresaId(userId);

    if (query.empresa_id) {
      const requestedId = parseBigInt(query.empresa_id, 'empresa_id');
      if (requestedId !== activeEmpresaId) {
        throw new ForbiddenException('Empresa no pertenece al usuario');
      }
    }

    const pagination = parsePaginationFromDto(query);

    const where: Record<string, unknown> = {
      empresa_id: activeEmpresaId,
    };

    if (query.q) {
      where.nombre = { contains: query.q };
    }

    const [data, total] = await Promise.all([
      this.prisma.fincas.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        select: {
          id_finca: true,
          empresa_id: true,
          nombre: true,
          area_hectareas: true,
          moneda_base_id: true,
          direccion: true,
          notas: true,
        },
        orderBy: { nombre: 'asc' },
      }),
      this.prisma.fincas.count({ where }),
    ]);

    const mapped = data.map((finca) => this.mapFinca(finca));
    return paginatedResponse(mapped, total, pagination);
  }

  async create(userId: bigint, dto: FincaCreateDto) {
    let empresaId: bigint;
    if (dto.empresa_id) {
      empresaId = parseBigInt(dto.empresa_id, 'empresa_id');
      await this.tenancyService.assertEmpresaBelongs(userId, empresaId);
      const activeEmpresaId =
        await this.tenancyService.getActiveEmpresaId(userId);
      if (activeEmpresaId && BigInt(activeEmpresaId) !== empresaId) {
        throw new ForbiddenException('Empresa no pertenece al usuario');
      }
    } else {
      empresaId = await this.tenancyService.requireActiveEmpresaId(userId);
    }

    const created = await this.prisma.fincas.create({
      data: {
        empresa_id: empresaId,
        nombre: dto.nombre,
        area_hectareas: dto.area_hectareas ?? null,
        moneda_base_id: parseBigInt(dto.moneda_base_id, 'moneda_base_id'),
        direccion: dto.direccion ?? null,
        notas: dto.notas ?? null,
      },
      select: {
        id_finca: true,
        empresa_id: true,
        nombre: true,
        area_hectareas: true,
        moneda_base_id: true,
        direccion: true,
        notas: true,
      },
    });

    return this.mapFinca(created);
  }

  async update(userId: bigint, fincaId: bigint, dto: FincaUpdateDto) {
    const activeEmpresaId =
      await this.tenancyService.requireActiveEmpresaId(userId);

    const existing = await this.prisma.fincas.findFirst({
      where: {
        id_finca: fincaId,
        empresa_id: activeEmpresaId,
      },
    });

    if (!existing) {
      throw new NotFoundException('Finca no encontrada');
    }

    await this.prisma.fincas.updateMany({
      where: {
        id_finca: fincaId,
        empresa_id: activeEmpresaId,
      },
      data: {
        nombre: dto.nombre ?? undefined,
        area_hectareas: dto.area_hectareas ?? undefined,
        moneda_base_id: dto.moneda_base_id
          ? parseBigInt(dto.moneda_base_id, 'moneda_base_id')
          : undefined,
        direccion: dto.direccion ?? undefined,
        notas: dto.notas ?? undefined,
      },
    });

    const updated = await this.prisma.fincas.findFirst({
      where: {
        id_finca: fincaId,
        empresa_id: activeEmpresaId,
      },
      select: {
        id_finca: true,
        empresa_id: true,
        nombre: true,
        area_hectareas: true,
        moneda_base_id: true,
        direccion: true,
        notas: true,
      },
    });
    if (!updated) {
      throw new NotFoundException('Finca no encontrada');
    }
    return this.mapFinca(updated);
  }

  private mapFinca(finca: {
    id_finca: bigint;
    empresa_id: bigint;
    nombre: string;
    area_hectareas: unknown | null;
    moneda_base_id: bigint;
    direccion: string | null;
    notas: string | null;
  }) {
    return {
      id: finca.id_finca.toString(),
      empresa_id: finca.empresa_id.toString(),
      nombre: finca.nombre,
      area_hectareas:
        finca.area_hectareas === null
          ? null
          : (finca.area_hectareas as { toString: () => string }).toString(),
      moneda_base_id: finca.moneda_base_id.toString(),
      direccion: finca.direccion,
      notas: finca.notas,
    };
  }
}
