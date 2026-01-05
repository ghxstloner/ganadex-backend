import {
  ForbiddenException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type EmpresaSessionItem = {
  id: string;
  nombre: string;
  logo_url: string | null;
  rol_id?: string | null;
  rol_nombre?: string | null;
};

@Injectable()
export class TenancyService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserEmpresas(userId: bigint): Promise<EmpresaSessionItem[]> {
    const relaciones = await this.prisma.usuario_empresas.findMany({
      where: {
        id_usuario: userId,
        estado: 'activo',
      },
      include: {
        empresas: true,
        roles: true,
      },
    });

    return relaciones.map((rel) => ({
      id: rel.empresas.id_empresa.toString(),
      nombre: rel.empresas.nombre,
      logo_url: null,
      rol_id: rel.roles?.id_rol?.toString() ?? null,
      rol_nombre: rel.roles?.nombre ?? null,
    }));
  }

  async getActiveEmpresaId(userId: bigint): Promise<string | null> {
    const rows = await this.prisma.$queryRaw<{ id_empresa: bigint }[]>`
      SELECT id_empresa
      FROM usuario_empresas
      WHERE id_usuario = ${userId}
        AND estado = 'activo'
        AND es_activa = 1
      LIMIT 1
    `;
    if (!rows.length) {
      return null;
    }
    return rows[0].id_empresa.toString();
  }

  async clearActiveEmpresa(userId: bigint) {
    await this.prisma.$executeRaw`
      UPDATE usuario_empresas
      SET es_activa = 0
      WHERE id_usuario = ${userId}
        AND estado = 'activo'
    `;
  }

  async setActiveEmpresa(userId: bigint, empresaId: bigint) {
    await this.prisma.$executeRaw`
      UPDATE usuario_empresas
      SET es_activa = CASE
        WHEN id_empresa = ${empresaId} THEN 1
        ELSE 0
      END
      WHERE id_usuario = ${userId}
        AND estado = 'activo'
    `;
  }

  async requireActiveEmpresaId(userId: bigint): Promise<bigint> {
    const empresas = await this.getUserEmpresas(userId);
    let activeId = await this.getActiveEmpresaId(userId);
    if (activeId && !empresas.some((empresa) => empresa.id === activeId)) {
      await this.clearActiveEmpresa(userId);
      activeId = null;
    }
    if (activeId) {
      return BigInt(activeId);
    }
    if (empresas.length === 1) {
      const selected = BigInt(empresas[0].id);
      await this.setActiveEmpresa(userId, selected);
      return selected;
    }
    throw new UnprocessableEntityException('Empresa activa requerida');
  }

  async assertEmpresaBelongs(userId: bigint, empresaId: bigint) {
    const relacion = await this.prisma.usuario_empresas.findFirst({
      where: {
        id_usuario: userId,
        id_empresa: empresaId,
        estado: 'activo',
      },
      select: {
        id_empresa: true,
      },
    });
    if (!relacion) {
      throw new ForbiddenException('Empresa no pertenece al usuario');
    }
  }
}
