import { UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ADMIN_ROLE_CODE,
  OWNER_ROLE_CODE,
  RBAC_PERMISSION_CODES,
} from './rbac.constants';

type BaseRolesResult = {
  ownerRoleId: bigint;
  adminRoleId: bigint;
};

export const ensureEmpresaBaseRoles = async (
  prisma: PrismaService,
  empresaId: bigint,
): Promise<BaseRolesResult> => {
  const ambito = await prisma.ambitos_rol.findFirst({
    where: { codigo: 'empresa' },
  });

  if (!ambito) {
    throw new UnprocessableEntityException('Ambito empresa requerido');
  }

  const permisos = await prisma.permisos.findMany({
    where: { codigo: { in: [...RBAC_PERMISSION_CODES] } },
  });

  if (permisos.length !== RBAC_PERMISSION_CODES.length) {
    throw new UnprocessableEntityException(
      'Catalogo de permisos incompleto para RBAC',
    );
  }

  const permisosIds = permisos.map((permiso) => permiso.id_permiso);

  const existingRoles = await prisma.roles.findMany({
    where: {
      empresa_id: empresaId,
      codigo: { in: [OWNER_ROLE_CODE, ADMIN_ROLE_CODE] },
    },
    select: { id_rol: true, codigo: true },
  });

  const ensureRole = async (
    codigo: string,
    nombre: string,
    descripcion: string,
  ) => {
    const existing = existingRoles.find((role) => role.codigo === codigo);
    let roleId = existing?.id_rol;
    if (!roleId) {
      const created = await prisma.roles.create({
        data: {
          empresa_id: empresaId,
          id_ambito_rol: ambito.id_ambito_rol,
          codigo,
          nombre,
          descripcion,
          activo: true,
        },
        select: { id_rol: true },
      });
      roleId = created.id_rol;
    }

    await prisma.roles_permisos.createMany({
      data: permisosIds.map((id_permiso) => ({
        id_rol: roleId,
        id_permiso,
      })),
      skipDuplicates: true,
    });

    return roleId;
  };

  const ownerRoleId = await ensureRole(
    OWNER_ROLE_CODE,
    'Owner',
    'Acceso total a nivel empresa',
  );
  const adminRoleId = await ensureRole(
    ADMIN_ROLE_CODE,
    'Admin',
    'Acceso administrativo a nivel empresa',
  );

  return { ownerRoleId, adminRoleId };
};
