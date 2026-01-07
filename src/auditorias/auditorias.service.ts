import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { parseBigInt } from '../common/utils/parse-bigint';
import { parsePagination, parsePaginationFromDto, paginatedResponse } from '../common/utils/pagination.util';
import { CreateAuditoriaDto } from './dto/create-auditoria.dto';
import { QueryPaginationDto } from '../common/dto/query-pagination.dto';

@Injectable()
export class AuditoriasService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(empresaId: bigint, query: QueryPaginationDto) {
        const pagination = parsePaginationFromDto(query);

        const [data, total] = await Promise.all([
            this.prisma.auditorias_inventario.findMany({
                where: { empresa_id: empresaId },
                skip: pagination.skip,
                take: pagination.take,
                orderBy: { fecha_apertura: 'desc' },
                include: {
                    fincas: { select: { nombre: true } },
                    metodos_auditoria: { select: { nombre: true } },
                    usuarios: { select: { nombre: true } },
                    _count: { select: { auditoria_detalle: true } },
                },
            }),
            this.prisma.auditorias_inventario.count({ where: { empresa_id: empresaId } }),
        ]);

        const mapped = data.map((a) => ({
            id: a.id_auditoria.toString(),
            id_finca: a.id_finca.toString(),
            finca_nombre: a.fincas.nombre,
            fecha_apertura: a.fecha_apertura,
            fecha_cierre: a.fecha_cierre,
            metodo: a.metodos_auditoria.nombre,
            estado: a.estado,
            observaciones: a.observaciones,
            creado_por: a.usuarios?.nombre ?? null,
            total_detalles: a._count.auditoria_detalle,
        }));

        return paginatedResponse(mapped, total, pagination);
    }

    async findOne(empresaId: bigint, id: bigint) {
        const auditoria = await this.prisma.auditorias_inventario.findFirst({
            where: { id_auditoria: id, empresa_id: empresaId },
            include: {
                fincas: { select: { nombre: true } },
                metodos_auditoria: { select: { nombre: true } },
                usuarios: { select: { nombre: true } },
                auditoria_detalle: {
                    include: {
                        animales: { select: { nombre: true, id_animal: true } },
                        tipos_identificacion: { select: { nombre: true } },
                    },
                },
            },
        });

        if (!auditoria) {
            throw new NotFoundException('Auditoría no encontrada');
        }

        return {
            id: auditoria.id_auditoria.toString(),
            id_finca: auditoria.id_finca.toString(),
            finca_nombre: auditoria.fincas.nombre,
            fecha_apertura: auditoria.fecha_apertura,
            fecha_cierre: auditoria.fecha_cierre,
            metodo: auditoria.metodos_auditoria.nombre,
            estado: auditoria.estado,
            observaciones: auditoria.observaciones,
            creado_por: auditoria.usuarios?.nombre ?? null,
            detalles: auditoria.auditoria_detalle.map((d) => ({
                id: d.id_detalle.toString(),
                id_animal: d.id_animal?.toString() ?? null,
                animal_nombre: d.animales?.nombre ?? null,
                tipo_identificacion: d.tipos_identificacion?.nombre ?? null,
                valor_leido: d.valor_leido,
                encontrado: d.encontrado,
                incidencia: d.incidencia,
                notas: d.notas,
            })),
        };
    }

    async create(empresaId: bigint, dto: CreateAuditoriaDto) {
        const id_finca = parseBigInt(dto.id_finca, 'id_finca');
        const id_metodo = parseBigInt(dto.id_metodo_auditoria, 'id_metodo_auditoria');

        const finca = await this.prisma.fincas.findFirst({
            where: { id_finca, empresa_id: empresaId },
        });
        if (!finca) {
            throw new NotFoundException('Finca no encontrada');
        }

        const auditoria = await this.prisma.auditorias_inventario.create({
            data: {
                empresa_id: empresaId,
                id_finca,
                fecha_apertura: new Date(dto.fecha_apertura),
                id_metodo_auditoria: id_metodo,
                estado: 'abierta',
                observaciones: dto.observaciones ?? null,
            },
        });

        return { id: auditoria.id_auditoria.toString(), created: true };
    }
}
