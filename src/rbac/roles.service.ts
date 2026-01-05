import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoleCreateDto } from './dto/role-create.dto';
import { RoleUpdateDto } from './dto/role-update.dto';
import { OWNER_ROLE_CODE, ADMIN_ROLE_CODE } from './rbac.constants';

type RoleResponse = {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  permisos: { id: string; codigo: string; nombre: string }[];
};

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(empresaId: bigint): Promise<RoleResponse[]> {
    const roles = await this.prisma.roles.findMany({
      where: { empresa_id: empresaId },
      include: {
        roles_permisos: {
          include: { permisos: true },
        },
      },
      orderBy: { nombre: 'asc' },
    });

    return roles.map((role) => ({
      id: role.id_rol.toString(),
      codigo: role.codigo,
      nombre: role.nombre,
      descripcion: role.descripcion ?? null,
      permisos: role.roles_permisos.map((rp) => ({
        id: rp.permisos.id_permiso.toString(),
        codigo: rp.permisos.codigo,
        nombre: rp.permisos.nombre,
      })),
    }));
  }

  async create(empresaId: bigint, dto: RoleCreateDto): Promise<RoleResponse> {
    const codigo = this.normalizeCodigo(dto.nombre);
    await this.assertRoleAvailable(empresaId, codigo, dto.nombre);

    const permisos = await this.resolvePermisos(dto.permisos);
    const ambito = await this.resolveAmbitoEmpresa();

    const role = await this.prisma.roles.create({
      data: {
        empresa_id: empresaId,
        id_ambito_rol: ambito.id_ambito_rol,
        codigo,
        nombre: dto.nombre,
        descripcion: dto.descripcion ?? null,
        activo: true,
      },
    });

    await this.prisma.roles_permisos.createMany({
      data: permisos.map((permiso) => ({
        id_rol: role.id_rol,
        id_permiso: permiso.id_permiso,
      })),
      skipDuplicates: true,
    });

    return this.mapRole(role, permisos);
  }

  async update(
    empresaId: bigint,
    roleId: bigint,
    dto: RoleUpdateDto,
  ): Promise<RoleResponse> {
    const role = await this.prisma.roles.findFirst({
      where: { id_rol: roleId, empresa_id: empresaId },
      include: {
        roles_permisos: {
          include: { permisos: true },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Rol no encontrado');
    }

    if (dto.nombre) {
      await this.assertRoleAvailable(
        empresaId,
        role.codigo,
        dto.nombre,
        roleId,
      );
    }

    let permisos = role.roles_permisos.map((rp) => rp.permisos);
    await this.prisma.$transaction(async (tx) => {
      await tx.roles.update({
        where: { id_rol: roleId },
        data: {
          nombre: dto.nombre ?? undefined,
          descripcion: dto.descripcion ?? undefined,
        },
      });

      if (dto.permisos) {
        permisos = await this.resolvePermisos(dto.permisos);
        await tx.roles_permisos.deleteMany({ where: { id_rol: roleId } });
        await tx.roles_permisos.createMany({
          data: permisos.map((permiso) => ({
            id_rol: roleId,
            id_permiso: permiso.id_permiso,
          })),
          skipDuplicates: true,
        });
      }
    });

    const updated = {
      ...role,
      nombre: dto.nombre ?? role.nombre,
      descripcion:
        dto.descripcion !== undefined ? dto.descripcion : role.descripcion,
    };

    return this.mapRole(updated, permisos);
  }

  async remove(empresaId: bigint, roleId: bigint) {
    const role = await this.prisma.roles.findFirst({
      where: { id_rol: roleId, empresa_id: empresaId },
      select: { id_rol: true, codigo: true },
    });

    if (!role) {
      throw new NotFoundException('Rol no encontrado');
    }

    if ([OWNER_ROLE_CODE, ADMIN_ROLE_CODE].includes(role.codigo)) {
      throw new ConflictException('No se puede eliminar el rol base');
    }

    const assigned = await this.prisma.usuario_empresas.findFirst({
      where: {
        id_empresa: empresaId,
        id_rol: roleId,
        estado: 'activo',
      },
      select: { id_usuario: true },
    });

    if (assigned) {
      throw new ConflictException('El rol tiene usuarios asignados');
    }

    await this.prisma.roles.delete({ where: { id_rol: roleId } });
    return { deleted: true };
  }

  private async resolvePermisos(codigos: string[]) {
    const unique = Array.from(
      new Set(codigos.map((codigo) => codigo.trim()).filter(Boolean)),
    );

    if (!unique.length) {
      throw new UnprocessableEntityException('Permisos requeridos');
    }

    const permisos = await this.prisma.permisos.findMany({
      where: { codigo: { in: unique } },
    });

    if (permisos.length !== unique.length) {
      throw new UnprocessableEntityException('Permisos invalidos');
    }

    return permisos;
  }

  private async resolveAmbitoEmpresa() {
    const ambito = await this.prisma.ambitos_rol.findFirst({
      where: { codigo: 'empresa' },
    });
    if (!ambito) {
      throw new UnprocessableEntityException('Ambito empresa requerido');
    }
    return ambito;
  }

  private async assertRoleAvailable(
    empresaId: bigint,
    codigo: string,
    nombre: string,
    roleId?: bigint,
  ) {
    const existing = await this.prisma.roles.findFirst({
      where: {
        empresa_id: empresaId,
        OR: [{ codigo }, { nombre }],
        NOT: roleId ? { id_rol: roleId } : undefined,
      },
      select: { id_rol: true },
    });
    if (existing) {
      throw new ConflictException('Ya existe un rol con ese nombre o codigo');
    }
  }

  private normalizeCodigo(nombre: string) {
    return nombre
      .normalize('NFD')
      .replace(/[^A-Za-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .toLowerCase();
  }

  private mapRole(
    role: { id_rol: bigint; codigo: string; nombre: string; descripcion: string | null },
    permisos: { id_permiso: bigint; codigo: string; nombre: string }[],
  ): RoleResponse {
    return {
      id: role.id_rol.toString(),
      codigo: role.codigo,
      nombre: role.nombre,
      descripcion: role.descripcion ?? null,
      permisos: permisos.map((permiso) => ({
        id: permiso.id_permiso.toString(),
        codigo: permiso.codigo,
        nombre: permiso.nombre,
      })),
    };
  }
}
