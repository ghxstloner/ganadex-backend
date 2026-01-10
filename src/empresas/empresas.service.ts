import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ensureEmpresaBaseRoles } from '../rbac/rbac.bootstrap';
import { TenancyService } from '../tenancy/tenancy.service';
import { EmpresaCreateDto } from './dto/empresa-create.dto';
import { EmpresaUpdateDto } from './dto/empresa-update.dto';

@Injectable()
export class EmpresasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenancyService: TenancyService,
  ) {}

  async listForUser(userId: bigint) {
    return this.tenancyService.getUserEmpresas(userId);
  }

  async create(userId: bigint, dto: EmpresaCreateDto) {
    const empresa = await this.prisma.empresas.create({
      data: {
        nombre: dto.nombre,
        documento_fiscal: dto.documento_fiscal ?? null,
        notas: dto.notas ?? null,
        estado: 'activa',
      },
    });

    const { ownerRoleId } = await ensureEmpresaBaseRoles(
      this.prisma,
      empresa.id_empresa,
    );

    await this.prisma.usuario_empresas.create({
      data: {
        id_usuario: userId,
        id_empresa: empresa.id_empresa,
        id_rol: ownerRoleId,
        estado: 'activo',
      },
    });

    return {
      id: empresa.id_empresa.toString(),
      nombre: empresa.nombre,
      documento_fiscal: empresa.documento_fiscal ?? null,
      estado: empresa.estado,
      notas: empresa.notas ?? null,
      logo_url: null,
    };
  }

  async update(userId: bigint, empresaId: bigint, dto: EmpresaUpdateDto) {
    const activeEmpresaId =
      await this.tenancyService.requireActiveEmpresaId(userId);
    if (activeEmpresaId !== empresaId) {
      throw new ForbiddenException('Empresa no pertenece al usuario');
    }

    const existing = await this.prisma.empresas.findUnique({
      where: { id_empresa: empresaId },
    });

    if (!existing) {
      throw new NotFoundException('Empresa no encontrada');
    }

    const updated = await this.prisma.empresas.update({
      where: { id_empresa: empresaId },
      data: {
        nombre: dto.nombre ?? undefined,
        documento_fiscal: dto.documento_fiscal ?? undefined,
        estado: dto.estado ?? undefined,
        notas: dto.notas ?? undefined,
      },
    });

    return {
      id: updated.id_empresa.toString(),
      nombre: updated.nombre,
      documento_fiscal: updated.documento_fiscal ?? null,
      estado: updated.estado,
      notas: updated.notas ?? null,
      logo_url: null,
    };
  }
}
