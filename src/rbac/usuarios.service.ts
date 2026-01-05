import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { parseBigInt } from '../common/utils/parse-bigint';
import { UserCreateDto } from './dto/user-create.dto';
import { UserRoleUpdateDto } from './dto/user-role-update.dto';
import { UserUpdateDto } from './dto/user-update.dto';
import { OWNER_ROLE_CODE } from './rbac.constants';

type UserResponse = {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  activo: boolean;
  rol: { id: string; nombre: string } | null;
  created_at: string | null;
  updated_at: string | null;
};

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async list(empresaId: bigint): Promise<UserResponse[]> {
    const relaciones = await this.prisma.usuario_empresas.findMany({
      where: { id_empresa: empresaId, estado: 'activo' },
      include: {
        usuarios: true,
        roles: true,
      },
      orderBy: { created_at: 'asc' },
    });

    return relaciones.map((rel) => this.mapUsuario(rel.usuarios, rel.roles));
  }

  async getMe(userId: bigint, empresaId: bigint): Promise<UserResponse> {
    const relacion = await this.prisma.usuario_empresas.findFirst({
      where: { id_usuario: userId, id_empresa: empresaId, estado: 'activo' },
      include: { usuarios: true, roles: true },
    });

    if (!relacion) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return this.mapUsuario(relacion.usuarios, relacion.roles);
  }

  async create(empresaId: bigint, dto: UserCreateDto): Promise<UserResponse> {
    const email = dto.email.toLowerCase().trim();
    const roleId = parseBigInt(dto.rol_id, 'rol_id');

    const role = await this.prisma.roles.findFirst({
      where: { id_rol: roleId, empresa_id: empresaId },
      select: { id_rol: true, nombre: true },
    });

    if (!role) {
      throw new NotFoundException('Rol no encontrado');
    }

    let user = await this.prisma.usuarios.findUnique({
      where: { email },
    });

    if (!user) {
      const passwordHash = dto.password
        ? await bcrypt.hash(dto.password, 12)
        : null;
      user = await this.prisma.usuarios.create({
        data: {
          email,
          nombre: dto.nombre,
          telefono: dto.telefono ?? null,
          password_hash: passwordHash,
          activo: true,
        },
      });
    }

    const relacion = await this.prisma.usuario_empresas.findUnique({
      where: {
        id_usuario_id_empresa: {
          id_usuario: user.id_usuario,
          id_empresa: empresaId,
        },
      },
      include: { roles: true },
    });

    if (relacion && relacion.estado === 'activo') {
      throw new ConflictException('El usuario ya pertenece a la empresa');
    }

    if (relacion) {
      await this.prisma.usuario_empresas.update({
        where: {
          id_usuario_id_empresa: {
            id_usuario: user.id_usuario,
            id_empresa: empresaId,
          },
        },
        data: {
          id_rol: roleId,
          estado: 'activo',
        },
      });
    } else {
      await this.prisma.usuario_empresas.create({
        data: {
          id_usuario: user.id_usuario,
          id_empresa: empresaId,
          id_rol: roleId,
          estado: 'activo',
        },
      });
    }

    return this.mapUsuario(user, { id_rol: roleId, nombre: role.nombre });
  }

  async update(
    empresaId: bigint,
    userId: bigint,
    dto: UserUpdateDto,
  ): Promise<UserResponse> {
    const relacion = await this.prisma.usuario_empresas.findFirst({
      where: { id_usuario: userId, id_empresa: empresaId, estado: 'activo' },
      include: { roles: true, usuarios: true },
    });

    if (!relacion) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (dto.activo === false) {
      await this.assertNotLastOwner(empresaId, userId);
    }

    const updated = await this.prisma.usuarios.update({
      where: { id_usuario: userId },
      data: {
        nombre: dto.nombre ?? undefined,
        telefono: dto.telefono ?? undefined,
        activo: dto.activo ?? undefined,
      },
    });

    return this.mapUsuario(updated, relacion.roles);
  }

  async updateRole(
    empresaId: bigint,
    userId: bigint,
    dto: UserRoleUpdateDto,
  ): Promise<UserResponse> {
    const roleId = parseBigInt(dto.rol_id, 'rol_id');
    const relacion = await this.prisma.usuario_empresas.findFirst({
      where: { id_usuario: userId, id_empresa: empresaId, estado: 'activo' },
      include: { roles: true, usuarios: true },
    });

    if (!relacion) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const newRole = await this.prisma.roles.findFirst({
      where: { id_rol: roleId, empresa_id: empresaId },
      select: { id_rol: true, codigo: true, nombre: true },
    });

    if (!newRole) {
      throw new NotFoundException('Rol no encontrado');
    }

    if (
      relacion.roles?.codigo === OWNER_ROLE_CODE &&
      newRole.codigo !== OWNER_ROLE_CODE
    ) {
      await this.assertNotLastOwner(empresaId, userId);
    }

    await this.prisma.usuario_empresas.update({
      where: {
        id_usuario_id_empresa: { id_usuario: userId, id_empresa: empresaId },
      },
      data: { id_rol: roleId },
    });

    return this.mapUsuario(relacion.usuarios, {
      id_rol: newRole.id_rol,
      nombre: newRole.nombre,
    });
  }

  async remove(empresaId: bigint, userId: bigint) {
    const relacion = await this.prisma.usuario_empresas.findFirst({
      where: { id_usuario: userId, id_empresa: empresaId, estado: 'activo' },
      include: { roles: true },
    });

    if (!relacion) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (relacion.roles?.codigo === OWNER_ROLE_CODE) {
      await this.assertNotLastOwner(empresaId, userId);
    }

    await this.prisma.usuario_empresas.delete({
      where: {
        id_usuario_id_empresa: { id_usuario: userId, id_empresa: empresaId },
      },
    });

    return { deleted: true };
  }

  private async assertNotLastOwner(empresaId: bigint, userId: bigint) {
    const owners = await this.prisma.usuario_empresas.findMany({
      where: {
        id_empresa: empresaId,
        estado: 'activo',
        roles: { codigo: OWNER_ROLE_CODE },
        usuarios: { activo: true },
      },
      select: { id_usuario: true },
    });

    if (owners.length === 1 && owners[0].id_usuario === userId) {
      throw new ConflictException(
        'La empresa debe conservar al menos un owner',
      );
    }
  }

  private mapUsuario(
    user: {
      id_usuario: bigint;
      nombre: string;
      email: string;
      telefono: string | null;
      activo: boolean;
      created_at: Date;
      updated_at: Date;
    },
    role?: { id_rol: bigint; nombre: string } | null,
  ): UserResponse {
    return {
      id: user.id_usuario.toString(),
      nombre: user.nombre,
      email: user.email,
      telefono: user.telefono ?? null,
      activo: user.activo,
      rol: role ? { id: role.id_rol.toString(), nombre: role.nombre } : null,
      created_at: user.created_at?.toISOString() ?? null,
      updated_at: user.updated_at?.toISOString() ?? null,
    };
  }
}
