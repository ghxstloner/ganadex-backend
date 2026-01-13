import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { parseBigInt } from '../common/utils/parse-bigint';
import {
  parsePagination,
  parsePaginationFromDto,
  parseSort,
  paginatedResponse,
} from '../common/utils/pagination.util';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { QueryAnimalDto } from './dto/query-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';
import { CreateRazaDto } from './dto/create-raza.dto';
import { CreateColorDto } from './dto/create-color.dto';
import { UploadService } from '../common/services/upload.service';

@Injectable()
export class AnimalesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  async findAll(empresaId: bigint, query: QueryAnimalDto) {
    const pagination = parsePaginationFromDto(query);
    const sortParams = parseSort(query.sortBy, query.sortDir, [
      'nombre',
      'fecha_nacimiento',
      'sexo',
      'created_at',
    ]);

    const where: Record<string, unknown> = { empresa_id: empresaId };

    if (query.id_finca) {
      where.id_finca = parseBigInt(query.id_finca, 'id_finca');
    }
    if (query.sexo) {
      // Convert friendly values back to database values for filtering
      let sexoValue = query.sexo;
      if (sexoValue === 'macho') sexoValue = 'M';
      if (sexoValue === 'hembra') sexoValue = 'F';
      where.sexo = sexoValue;
    }
    if (query.id_raza) {
      where.id_raza = parseBigInt(query.id_raza, 'id_raza');
    }
    if (query.id_color_pelaje) {
      where.id_color_pelaje = parseBigInt(query.id_color_pelaje, 'id_color_pelaje');
    }
    if (query.fecha_nacimiento_desde || query.fecha_nacimiento_hasta) {
      where.fecha_nacimiento = {};
      if (query.fecha_nacimiento_desde) {
        (where.fecha_nacimiento as Record<string, unknown>).gte = new Date(
          query.fecha_nacimiento_desde,
        );
      }
      if (query.fecha_nacimiento_hasta) {
        (where.fecha_nacimiento as Record<string, unknown>).lte = new Date(
          query.fecha_nacimiento_hasta,
        );
      }
    }
    if (query.con_padre !== undefined) {
      if (query.con_padre) {
        where.padre_id = { not: null };
      } else {
        where.padre_id = null;
      }
    }
    if (query.con_madre !== undefined) {
      if (query.con_madre) {
        where.madre_id = { not: null };
      } else {
        where.madre_id = null;
      }
    }
    if (query.id_estado) {
      // Check if id_estado is a number (ID) or string (codigo)
      const estadoValue = query.id_estado;
      const isNumeric = /^\d+$/.test(estadoValue);

      if (isNumeric) {
        // Filter by ID
        where.animal_estados_historial = {
          some: {
            id_estado_animal: parseBigInt(estadoValue, 'id_estado'),
            fecha_fin: null, // Only current/active estados
          },
        };
      } else {
        // Filter by codigo
        where.animal_estados_historial = {
          some: {
            estados_animales: {
              codigo: estadoValue,
            },
            fecha_fin: null, // Only current/active estados
          },
        };
      }
    }

    if (query.q) {
      // Search by name or by active identification
      where.OR = [
        { nombre: { contains: query.q } },
        {
          animal_identificaciones: {
            some: {
              valor: { contains: query.q },
              activo: true,
            },
          },
        },
      ];
    }

    if (query.solo_activos) {
      // Filter for animals that are currently active
      if (where.animal_estados_historial) {
        // If there's already an estado filter, modify it to include activo
        const existingFilter = where.animal_estados_historial as any;
        existingFilter.some = {
          ...existingFilter.some,
          estados_animales: {
            ...existingFilter.some.estados_animales,
            codigo: 'activo',
          },
          fecha_fin: null,
        };
      } else {
        // No existing estado filter, create one for activos
        where.animal_estados_historial = {
          some: {
            estados_animales: { codigo: 'activo' },
            fecha_fin: null,
          },
        };
      }
    }

    const orderBy = sortParams.sortBy
      ? { [sortParams.sortBy]: sortParams.sortDir }
      : { created_at: 'desc' as const };

    const [data, total] = await Promise.all([
      this.prisma.animales.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy,
        include: {
          fincas: { select: { nombre: true, id_finca: true } },
          razas: { select: { nombre: true, id_raza: true } },
          colores_pelaje: { select: { id_color: true, nombre: true } },
        },
      }),
      this.prisma.animales.count({ where }),
    ]);

    const mapped = data.map((animal) => this.mapAnimal(animal));
    return paginatedResponse(mapped, total, pagination);
  }

  async findOne(empresaId: bigint, id: bigint) {
    const animal = await this.prisma.animales.findFirst({
      where: { id_animal: id, empresa_id: empresaId },
      include: {
        fincas: { select: { nombre: true, id_finca: true } },
        razas: { select: { nombre: true, id_raza: true } },
        colores_pelaje: { select: { id_color: true, nombre: true } },
        animales_animales_padre_id_empresa_idToanimales: {
          select: { id_animal: true, nombre: true },
        },
        animales_animales_madre_id_empresa_idToanimales: {
          select: { id_animal: true, nombre: true },
        },
      },
    });

    if (!animal) {
      throw new NotFoundException('Animal no encontrado');
    }

    return this.mapAnimal(animal);
  }

  async getProfile(empresaId: bigint, id: bigint) {
    const animal = await this.prisma.animales.findFirst({
      where: { id_animal: id, empresa_id: empresaId },
      include: {
        fincas: { select: { nombre: true, id_finca: true } },
        razas: { select: { nombre: true, id_raza: true } },
        colores_pelaje: { select: { id_color: true, nombre: true } },
        animales_animales_padre_id_empresa_idToanimales: {
          select: { id_animal: true, nombre: true },
        },
        animales_animales_madre_id_empresa_idToanimales: {
          select: { id_animal: true, nombre: true },
        },
        animal_identificaciones: {
          include: { tipos_identificacion: true },
          orderBy: { fecha_asignacion: 'desc' },
        },
        animal_estados_historial: {
          orderBy: { fecha_inicio: 'desc' },
          include: { estados_animales: true },
        },
        animal_categorias_historial: {
          orderBy: { fecha_inicio: 'desc' },
          include: { categorias_animales: true },
        },
        eventos_sanitarios: {
          orderBy: { fecha: 'desc' },
          take: 5,
          include: { enfermedades: true },
        },
        eventos_reproductivos_eventos_reproductivos_id_animal_empresa_idToanimales:
          {
            orderBy: { fecha: 'desc' },
            take: 5,
            include: { tipos_evento_reproductivo: true },
          },
        movimientos_animales: {
          orderBy: { fecha_hora: 'desc' },
          take: 5,
          include: {
            motivos_movimiento: true,
            potreros_movimientos_animales_potrero_destino_id_empresa_idTopotreros:
              { select: { nombre: true } },
            lotes_movimientos_animales_lote_destino_id_empresa_idTolotes: {
              select: { nombre: true },
            },
          },
        },
      },
    });

    if (!animal) {
      throw new NotFoundException('Animal no encontrado');
    }

    const estadoActual = animal.animal_estados_historial.find(e => !e.fecha_fin) ?? animal.animal_estados_historial[0] ?? null;
    const categoriaActual = animal.animal_categorias_historial.find(c => !c.fecha_fin) ?? animal.animal_categorias_historial[0] ?? null;

    return {
      ...this.mapAnimal(animal),
      estado_actual: estadoActual
        ? {
            id: estadoActual.estados_animales.id_estado_animal.toString(),
            codigo: estadoActual.estados_animales.codigo,
            nombre: estadoActual.estados_animales.nombre,
            desde: estadoActual.fecha_inicio,
            hasta: estadoActual.fecha_fin,
          }
        : null,
      categoria_actual: categoriaActual
        ? {
            id: categoriaActual.categorias_animales.id_categoria_animal.toString(),
            codigo: categoriaActual.categorias_animales.codigo,
            nombre: categoriaActual.categorias_animales.nombre,
            desde: categoriaActual.fecha_inicio,
            hasta: categoriaActual.fecha_fin,
          }
        : null,
      identificaciones: animal.animal_identificaciones.map((iden) => ({
        id: iden.id_animal_identificacion.toString(),
        tipo: iden.tipos_identificacion.nombre,
        tipo_id: iden.tipos_identificacion.id_tipo_identificacion.toString(),
        valor: iden.valor,
        fecha_asignacion: iden.fecha_asignacion,
        activo: iden.activo,
        observaciones: iden.observaciones,
      })),
      historial_estados: animal.animal_estados_historial.map((h) => ({
        id: h.id_hist.toString(),
        estado_id: h.estados_animales.id_estado_animal.toString(),
        estado_codigo: h.estados_animales.codigo,
        estado_nombre: h.estados_animales.nombre,
        fecha_inicio: h.fecha_inicio,
        fecha_fin: h.fecha_fin,
        motivo: h.motivo,
      })),
      historial_categorias: animal.animal_categorias_historial.map((h) => ({
        id: h.id_hist.toString(),
        categoria_id: h.categorias_animales.id_categoria_animal.toString(),
        categoria_codigo: h.categorias_animales.codigo,
        categoria_nombre: h.categorias_animales.nombre,
        fecha_inicio: h.fecha_inicio,
        fecha_fin: h.fecha_fin,
        observaciones: h.observaciones,
      })),
      eventos_sanitarios_recientes: animal.eventos_sanitarios.map((ev) => ({
        id: ev.id_evento_sanitario.toString(),
        fecha: ev.fecha,
        enfermedad: ev.enfermedades?.nombre ?? null,
        descripcion: ev.descripcion,
      })),
      eventos_reproductivos_recientes:
        animal.eventos_reproductivos_eventos_reproductivos_id_animal_empresa_idToanimales.map(
          (ev) => ({
            id: ev.id_evento_reproductivo.toString(),
            fecha: ev.fecha,
            tipo: ev.tipos_evento_reproductivo.nombre,
            detalles: ev.detalles,
          }),
        ),
      movimientos_recientes: animal.movimientos_animales.map((mov) => ({
        id: mov.id_movimiento.toString(),
        fecha_hora: mov.fecha_hora,
        motivo: mov.motivos_movimiento?.nombre ?? null,
        potrero_destino:
          mov
            .potreros_movimientos_animales_potrero_destino_id_empresa_idTopotreros
            ?.nombre ?? null,
        lote_destino:
          mov.lotes_movimientos_animales_lote_destino_id_empresa_idTolotes
            ?.nombre ?? null,
      })),
    };
  }

  async create(empresaId: bigint, dto: CreateAnimalDto) {
    const id_finca = parseBigInt(dto.id_finca, 'id_finca');

    // Verify finca belongs to empresa
    const finca = await this.prisma.fincas.findFirst({
      where: { id_finca, empresa_id: empresaId },
    });
    if (!finca) {
      throw new NotFoundException('Finca no encontrada');
    }

    const data: Record<string, unknown> = {
      empresa_id: empresaId,
      id_finca,
      nombre: dto.nombre ?? null,
      sexo: dto.sexo,
      fecha_nacimiento: dto.fecha_nacimiento
        ? new Date(dto.fecha_nacimiento)
        : null,
      fecha_nacimiento_estimada: dto.fecha_nacimiento_estimada ?? false,
      notas: dto.notas ?? null,
    };

    if (dto.id_raza) {
      data.id_raza = parseBigInt(dto.id_raza, 'id_raza');
    }
    if (dto.id_color_pelaje) {
      data.id_color_pelaje = parseBigInt(dto.id_color_pelaje, 'id_color_pelaje');
    }
    if (dto.padre_id) {
      data.padre_id = parseBigInt(dto.padre_id, 'padre_id');
    }
    if (dto.madre_id) {
      data.madre_id = parseBigInt(dto.madre_id, 'madre_id');
    }

    const animal = await this.prisma.animales.create({
      data: data as Parameters<typeof this.prisma.animales.create>[0]['data'],
      include: {
        fincas: { select: { nombre: true, id_finca: true } },
        razas: { select: { nombre: true, id_raza: true } },
      },
    });

    return this.mapAnimal(animal);
  }

  async update(empresaId: bigint, id: bigint, dto: UpdateAnimalDto) {
    const existing = await this.prisma.animales.findFirst({
      where: { id_animal: id, empresa_id: empresaId },
    });

    if (!existing) {
      throw new NotFoundException('Animal no encontrado');
    }

    const data: Record<string, unknown> = {};

    if (dto.nombre !== undefined) data.nombre = dto.nombre;
    if (dto.sexo !== undefined) data.sexo = dto.sexo;
    if (dto.fecha_nacimiento !== undefined) {
      data.fecha_nacimiento = dto.fecha_nacimiento
        ? new Date(dto.fecha_nacimiento)
        : null;
    }
    if (dto.fecha_nacimiento_estimada !== undefined) {
      data.fecha_nacimiento_estimada = dto.fecha_nacimiento_estimada;
    }
    if (dto.notas !== undefined) data.notas = dto.notas;
    if (dto.id_raza !== undefined) {
      data.id_raza = dto.id_raza ? parseBigInt(dto.id_raza, 'id_raza') : null;
    }
    if (dto.id_color_pelaje !== undefined) {
      data.id_color_pelaje = dto.id_color_pelaje ? parseBigInt(dto.id_color_pelaje, 'id_color_pelaje') : null;
    }
    if (dto.padre_id !== undefined) {
      data.padre_id = dto.padre_id
        ? parseBigInt(dto.padre_id, 'padre_id')
        : null;
    }
    if (dto.madre_id !== undefined) {
      data.madre_id = dto.madre_id
        ? parseBigInt(dto.madre_id, 'madre_id')
        : null;
    }
    if (dto.id_finca !== undefined) {
      const id_finca = parseBigInt(dto.id_finca, 'id_finca');
      const finca = await this.prisma.fincas.findFirst({
        where: { id_finca, empresa_id: empresaId },
      });
      if (!finca) {
        throw new NotFoundException('Finca no encontrada');
      }
      data.id_finca = id_finca;
    }

    data.updated_at = new Date();

    const animal = await this.prisma.animales.update({
      where: { id_animal_empresa_id: { id_animal: id, empresa_id: empresaId } },
      data: data as Parameters<typeof this.prisma.animales.update>[0]['data'],
      include: {
        fincas: { select: { nombre: true, id_finca: true } },
        razas: { select: { nombre: true, id_raza: true } },
        colores_pelaje: { select: { id_color: true, nombre: true } },
      },
    });

    return this.mapAnimal(animal);
  }

  async remove(empresaId: bigint, id: bigint) {
    const existing = await this.prisma.animales.findFirst({
      where: { id_animal: id, empresa_id: empresaId },
    });

    if (!existing) {
      throw new NotFoundException('Animal no encontrado');
    }

    await this.prisma.animales.delete({
      where: { id_animal_empresa_id: { id_animal: id, empresa_id: empresaId } },
    });

    return { deleted: true };
  }

  async getRazas(empresaId: bigint) {
    const razas = await this.prisma.razas.findMany({
      where: {
        OR: [{ empresa_id: null }, { empresa_id: empresaId }],
      },
      orderBy: { nombre: 'asc' },
    });

    return razas.map((r) => ({
      id: r.id_raza.toString(),
      codigo: r.codigo,
      nombre: r.nombre,
      es_global: r.empresa_id === null,
    }));
  }

  async getColoresPelaje() {
    const colores = await this.prisma.colores_pelaje.findMany({
      orderBy: { nombre: 'asc' },
    });

    return colores.map((c) => ({
      id: c.id_color.toString(),
      codigo: c.codigo,
      nombre: c.nombre,
    }));
  }

  async createRaza(empresaId: bigint, dto: CreateRazaDto) {
    // Verificar si ya existe una raza con el mismo código en la empresa o global
    const existing = await this.prisma.razas.findFirst({
      where: {
        OR: [
          { empresa_id: null, codigo: dto.codigo },
          { empresa_id: empresaId, codigo: dto.codigo },
        ],
      },
    });

    if (existing) {
      throw new ConflictException(
        'Ya existe una raza con ese código en tu empresa o globalmente',
      );
    }

    const raza = await this.prisma.razas.create({
      data: {
        empresa_id: empresaId,
        codigo: dto.codigo,
        nombre: dto.nombre,
      },
    });

    return {
      id: raza.id_raza.toString(),
      codigo: raza.codigo,
      nombre: raza.nombre,
      es_global: raza.empresa_id === null,
    };
  }

  async createColor(dto: CreateColorDto) {
    // Verificar si ya existe un color con el mismo código
    const existing = await this.prisma.colores_pelaje.findFirst({
      where: { codigo: dto.codigo },
    });

    if (existing) {
      throw new ConflictException('Ya existe un color con ese código');
    }

    const color = await this.prisma.colores_pelaje.create({
      data: {
        codigo: dto.codigo,
        nombre: dto.nombre,
      },
    });

    return {
      id: color.id_color.toString(),
      codigo: color.codigo,
      nombre: color.nombre,
    };
  }

  async uploadPhoto(
    empresaId: bigint,
    animalId: bigint,
    file: Express.Multer.File,
  ) {
    const animal = await this.prisma.animales.findFirst({
      where: { id_animal: animalId, empresa_id: empresaId },
    });

    if (!animal) {
      throw new NotFoundException('Animal no encontrado');
    }

    // Eliminar foto anterior si existe
    if (animal.foto_url) {
      await this.uploadService.deleteAnimalPhoto(animal.foto_url);
    }

    // Guardar nueva foto
    const fotoUrl = await this.uploadService.saveAnimalPhoto(
      empresaId,
      animalId,
      file,
    );

    // Actualizar animal con nueva URL
    await this.prisma.animales.update({
      where: {
        id_animal_empresa_id: {
          id_animal: animalId,
          empresa_id: empresaId,
        },
      },
      data: { foto_url: fotoUrl },
    });

    return { foto_url: fotoUrl };
  }

  async buscarAnimales(
    empresaId: bigint,
    query: string,
    sexo?: 'M' | 'F',
  ) {
    const where: Record<string, unknown> = {
      empresa_id: empresaId,
    };

    if (sexo) {
      where.sexo = sexo;
    }

    if (query) {
      where.OR = [
        { nombre: { contains: query } },
        {
          animal_identificaciones: {
            some: {
              valor: { contains: query },
              activo: true,
            },
          },
        },
      ];
    }

    const animales = await this.prisma.animales.findMany({
      where,
      take: 20,
      orderBy: { nombre: 'asc' },
      select: {
        id_animal: true,
        nombre: true,
        sexo: true,
        animal_identificaciones: {
          where: { activo: true },
          take: 1,
          include: { tipos_identificacion: true },
        },
      },
    });

    return animales.map((a) => ({
      id: a.id_animal.toString(),
      nombre: a.nombre ?? 'Sin nombre',
      sexo: a.sexo,
      identificacion: a.animal_identificaciones[0]?.valor ?? null,
    }));
  }

  private mapAnimal(animal: Record<string, unknown>) {
    const a = animal as {
      id_animal: bigint;
      empresa_id: bigint;
      id_finca: bigint;
      nombre: string | null;
      sexo: string;
      fecha_nacimiento: Date | null;
      fecha_nacimiento_estimada: boolean;
      id_raza: bigint | null;
      id_color_pelaje: bigint | null;
      padre_id: bigint | null;
      madre_id: bigint | null;
      foto_url: string | null;
      notas: string | null;
      created_at: Date;
      updated_at: Date;
      fincas?: { id_finca: bigint; nombre: string };
      razas?: { id_raza: bigint; nombre: string } | null;
      colores_pelaje?: { id_color: bigint; nombre: string } | null;
      animales_animales_padre_id_empresa_idToanimales?: {
        id_animal: bigint;
        nombre: string | null;
      } | null;
      animales_animales_madre_id_empresa_idToanimales?: {
        id_animal: bigint;
        nombre: string | null;
      } | null;
    };

    return {
      id: a.id_animal.toString(),
      empresa_id: a.empresa_id.toString(),
      id_finca: a.id_finca.toString(),
      finca_nombre: a.fincas?.nombre ?? null,
      nombre: a.nombre,
      sexo: a.sexo,
      fecha_nacimiento: a.fecha_nacimiento,
      fecha_nacimiento_estimada: a.fecha_nacimiento_estimada,
      id_raza: a.id_raza?.toString() ?? null,
      raza_nombre: a.razas?.nombre ?? null,
      id_color_pelaje: a.id_color_pelaje?.toString() ?? null,
      color_pelaje_nombre: a.colores_pelaje?.nombre ?? null,
      padre_id: a.padre_id?.toString() ?? null,
      padre_nombre:
        a.animales_animales_padre_id_empresa_idToanimales?.nombre ?? null,
      madre_id: a.madre_id?.toString() ?? null,
      madre_nombre:
        a.animales_animales_madre_id_empresa_idToanimales?.nombre ?? null,
      foto_url: a.foto_url,
      notas: a.notas,
      created_at: a.created_at,
      updated_at: a.updated_at,
    };
  }
}
