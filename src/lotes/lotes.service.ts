import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { parseBigInt } from '../common/utils/parse-bigint';
import { parsePagination, parsePaginationFromDto, paginatedResponse } from '../common/utils/pagination.util';
import { CreateLoteDto } from './dto/create-lote.dto';
import { QueryLoteDto } from './dto/query-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';

@Injectable()
export class LotesService {
    constructor(private readonly prisma: PrismaService) { }

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
}
