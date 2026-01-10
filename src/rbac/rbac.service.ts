import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RbacService {
  constructor(private readonly prisma: PrismaService) {}

  async getPermissionsCatalog() {
    const permisos = await this.prisma.permisos.findMany({
      orderBy: { codigo: 'asc' },
    });

    return permisos.map((permiso) => ({
      id: permiso.id_permiso.toString(),
      codigo: permiso.codigo,
      nombre: permiso.nombre,
      descripcion: permiso.descripcion ?? null,
    }));
  }

  async getUserPermissions(
    userId: bigint,
    empresaId: bigint,
  ): Promise<string[]> {
    const relation = await this.prisma.usuario_empresas.findFirst({
      where: {
        id_usuario: userId,
        id_empresa: empresaId,
        estado: 'activo',
      },
      select: {
        roles: {
          select: {
            roles_permisos: {
              select: { permisos: { select: { codigo: true } } },
            },
          },
        },
      },
    });

    if (!relation?.roles) {
      throw new ForbiddenException('Empresa no pertenece al usuario');
    }

    const permissions = relation.roles.roles_permisos.map(
      (item) => item.permisos.codigo,
    );

    return Array.from(new Set(permissions));
  }
}
