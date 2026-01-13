import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { parseBigInt } from '../../common/utils/parse-bigint';
import { CreateIdentificacionDto } from './dto/create-identificacion.dto';
import { UpdateIdentificacionDto } from './dto/update-identificacion.dto';

@Injectable()
export class IdentificacionesService {
  constructor(private readonly prisma: PrismaService) {}

  async findByAnimal(empresaId: bigint, animalId: bigint) {
    // Verify animal belongs to empresa
    const animal = await this.prisma.animales.findFirst({
      where: { id_animal: animalId, empresa_id: empresaId },
    });
    if (!animal) {
      throw new NotFoundException('Animal no encontrado');
    }

    const identificaciones = await this.prisma.animal_identificaciones.findMany(
      {
        where: { id_animal: animalId, empresa_id: empresaId },
        include: { tipos_identificacion: true },
        orderBy: { fecha_asignacion: 'desc' },
      },
    );

    return identificaciones.map((i) => this.mapIdentificacion(i));
  }

  async create(
    empresaId: bigint,
    animalId: bigint,
    dto: CreateIdentificacionDto,
  ) {
    // Verify animal belongs to empresa
    const animal = await this.prisma.animales.findFirst({
      where: { id_animal: animalId, empresa_id: empresaId },
    });
    if (!animal) {
      throw new NotFoundException('Animal no encontrado');
    }

    // Si se marca como principal, desmarcar las demás
    if (dto.es_principal) {
      await this.prisma.animal_identificaciones.updateMany({
        where: {
          id_animal: animalId,
          empresa_id: empresaId,
          es_principal: true,
        },
        data: { es_principal: false },
      });
    }

    const identificacion = await this.prisma.animal_identificaciones.create({
      data: {
        empresa_id: empresaId,
        id_animal: animalId,
        id_tipo_identificacion: parseBigInt(
          dto.id_tipo_identificacion,
          'id_tipo_identificacion',
        ),
        valor: dto.valor,
        fecha_asignacion: new Date(dto.fecha_asignacion),
        activo: dto.activo ?? true,
        es_principal: dto.es_principal ?? false,
        observaciones: dto.observaciones ?? null,
      },
      include: { tipos_identificacion: true },
    });

    return this.mapIdentificacion(identificacion);
  }

  async update(empresaId: bigint, id: bigint, dto: UpdateIdentificacionDto) {
    const existing = await this.prisma.animal_identificaciones.findFirst({
      where: { id_animal_identificacion: id, empresa_id: empresaId },
    });

    if (!existing) {
      throw new NotFoundException('Identificación no encontrada');
    }

    // Si se marca como principal, desmarcar las demás del mismo animal
    if (dto.es_principal === true) {
      await this.prisma.animal_identificaciones.updateMany({
        where: {
          id_animal: existing.id_animal,
          empresa_id: empresaId,
          id_animal_identificacion: { not: id },
          es_principal: true,
        },
        data: { es_principal: false },
      });
    }

    const data: Record<string, unknown> = {};
    if (dto.id_tipo_identificacion !== undefined) {
      data.id_tipo_identificacion = parseBigInt(
        dto.id_tipo_identificacion,
        'id_tipo_identificacion',
      );
    }
    if (dto.valor !== undefined) data.valor = dto.valor;
    if (dto.fecha_asignacion !== undefined) {
      data.fecha_asignacion = new Date(dto.fecha_asignacion);
    }
    if (dto.activo !== undefined) data.activo = dto.activo;
    if (dto.es_principal !== undefined) data.es_principal = dto.es_principal;
    if (dto.observaciones !== undefined) data.observaciones = dto.observaciones;

    const identificacion = await this.prisma.animal_identificaciones.update({
      where: { id_animal_identificacion: id },
      data,
      include: { tipos_identificacion: true },
    });

    return this.mapIdentificacion(identificacion);
  }

  async remove(empresaId: bigint, id: bigint) {
    const existing = await this.prisma.animal_identificaciones.findFirst({
      where: { id_animal_identificacion: id, empresa_id: empresaId },
    });

    if (!existing) {
      throw new NotFoundException('Identificación no encontrada');
    }

    await this.prisma.animal_identificaciones.delete({
      where: { id_animal_identificacion: id },
    });

    return { deleted: true };
  }

  async setPrincipal(empresaId: bigint, id: bigint) {
    const existing = await this.prisma.animal_identificaciones.findFirst({
      where: { id_animal_identificacion: id, empresa_id: empresaId },
    });

    if (!existing) {
      throw new NotFoundException('Identificación no encontrada');
    }

    // Desmarcar todas las identificaciones principales del mismo animal
    await this.prisma.animal_identificaciones.updateMany({
      where: {
        id_animal: existing.id_animal,
        empresa_id: empresaId,
        es_principal: true,
      },
      data: { es_principal: false },
    });

    // Marcar esta como principal
    const identificacion = await this.prisma.animal_identificaciones.update({
      where: { id_animal_identificacion: id },
      data: { es_principal: true },
      include: { tipos_identificacion: true },
    });

    return this.mapIdentificacion(identificacion);
  }

  async getTiposIdentificacion(empresaId: bigint) {
    const tipos = await this.prisma.tipos_identificacion.findMany({
      where: {
        OR: [{ empresa_id: null }, { empresa_id: empresaId }],
      },
      orderBy: { nombre: 'asc' },
    });

    return tipos.map((t) => ({
      id: t.id_tipo_identificacion.toString(),
      codigo: t.codigo,
      nombre: t.nombre,
      es_global: t.empresa_id === null,
    }));
  }

  private mapIdentificacion(i: {
    id_animal_identificacion: bigint;
    empresa_id: bigint;
    id_animal: bigint;
    id_tipo_identificacion: bigint;
    valor: string;
    fecha_asignacion: Date;
    activo: boolean;
    es_principal: boolean;
    observaciones: string | null;
    tipos_identificacion: { id_tipo_identificacion: bigint; nombre: string };
  }) {
    return {
      id: i.id_animal_identificacion.toString(),
      id_animal: i.id_animal.toString(),
      tipo_id: i.id_tipo_identificacion.toString(),
      tipo: i.tipos_identificacion.nombre,
      valor: i.valor,
      fecha_asignacion: i.fecha_asignacion.toISOString(),
      activo: i.activo,
      es_principal: i.es_principal,
      observaciones: i.observaciones,
    };
  }
}
