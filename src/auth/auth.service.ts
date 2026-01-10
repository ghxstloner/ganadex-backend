import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { parseBigInt } from '../common/utils/parse-bigint';
import { PrismaService } from '../prisma/prisma.service';
import { TenancyService } from '../tenancy/tenancy.service';
import { ensureEmpresaBaseRoles } from '../rbac/rbac.bootstrap';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

type SessionResponse = {
  user: {
    id: string;
    email: string;
    nombre: string;
    telefono?: string | null;
  };
  empresas: {
    id: string;
    nombre: string;
    logo_url: string | null;
    rol_id?: string | null;
    rol_nombre?: string | null;
  }[];
  empresa_activa_id: string | null;
};

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly tenancyService: TenancyService,
  ) {
    this.jwtSecret = process.env.JWT_ACCESS_SECRET ?? '';
    if (!this.jwtSecret) {
      throw new Error('JWT_ACCESS_SECRET es obligatorio');
    }
  }

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase().trim();

    const existing = await this.prisma.usuarios.findUnique({
      where: { email },
    });

    if (existing) {
      throw new ConflictException('El correo ya esta registrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const createdUser = await this.prisma.usuarios.create({
      data: {
        email,
        nombre: dto.nombre,
        telefono: dto.telefono ?? null,
        password_hash: passwordHash,
        activo: true,
      },
    });

    const empresas: SessionResponse['empresas'] = [];

    if (dto.empresa_id || dto.empresa_nombre) {
      const { empresa, created } = await this.resolveEmpresa(
        dto.empresa_id,
        dto.empresa_nombre,
      );
      const { ownerRoleId, adminRoleId } = await ensureEmpresaBaseRoles(
        this.prisma,
        empresa.id_empresa,
      );
      const roleId = created ? ownerRoleId : adminRoleId;
      const role = await this.prisma.roles.findUnique({
        where: { id_rol: roleId },
      });

      await this.prisma.usuario_empresas.create({
        data: {
          id_usuario: createdUser.id_usuario,
          id_empresa: empresa.id_empresa,
          id_rol: roleId,
          estado: 'activo',
        },
      });

      empresas.push({
        id: empresa.id_empresa.toString(),
        nombre: empresa.nombre,
        logo_url: null,
        rol_id: roleId.toString(),
        rol_nombre: role?.nombre ?? null,
      });
    }

    const accessToken = await this.signToken(createdUser.id_usuario, email);

    return {
      user: {
        id: createdUser.id_usuario.toString(),
        email: createdUser.email,
        nombre: createdUser.nombre,
        telefono: createdUser.telefono ?? null,
      },
      empresas,
      access_token: accessToken,
    };
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase().trim();

    const user = await this.prisma.usuarios.findUnique({
      where: { email },
    });

    if (!user || !user.activo || !user.password_hash) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const passwordValid = await bcrypt.compare(
      dto.password,
      user.password_hash,
    );
    if (!passwordValid) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const session = await this.buildSession(user.id_usuario);
    const shouldClearActive = session.empresas.length > 1;
    const accessToken = await this.signToken(
      user.id_usuario,
      email,
      shouldClearActive ? null : session.empresa_activa_id,
    );

    if (shouldClearActive) {
      session.empresa_activa_id = null;
    }

    return {
      ...session,
      access_token: accessToken,
    };
  }

  async getSession(userId: bigint): Promise<SessionResponse> {
    return this.buildSession(userId);
  }

  async setActiveEmpresa(userId: bigint, empresaId: string) {
    const parsedEmpresaId = parseBigInt(empresaId, 'empresa_id');
    await this.tenancyService.assertEmpresaBelongs(userId, parsedEmpresaId);
    await this.tenancyService.setActiveEmpresa(userId, parsedEmpresaId);
    const session = await this.buildSession(userId);
    const accessToken = await this.signToken(userId, session.user.email);
    return { ...session, access_token: accessToken };
  }

  private async signToken(
    userId: bigint,
    email: string,
    empresaActivaId?: string | null,
  ) {
    const activeId =
      empresaActivaId !== undefined
        ? empresaActivaId
        : await this.tenancyService.getActiveEmpresaId(userId);
    return this.jwtService.signAsync({
      sub: userId.toString(),
      email,
      empresa_activa_id: activeId ?? undefined,
      // TODO: Include empresa activa when refresh tokens/session model exists.
    });
  }

  private async resolveEmpresa(empresaId?: string, empresaNombre?: string) {
    if (empresaId) {
      const parsedId = parseBigInt(empresaId, 'empresa_id');
      const empresa = await this.prisma.empresas.findUnique({
        where: { id_empresa: parsedId },
      });
      if (!empresa) {
        throw new NotFoundException('Empresa no encontrada');
      }
      return { empresa, created: false };
    }

    if (!empresaNombre) {
      throw new UnprocessableEntityException('Datos de empresa requeridos');
    }

    const empresa = await this.prisma.empresas.create({
      data: {
        nombre: empresaNombre,
      },
    });

    return { empresa, created: true };
  }

  private async buildSession(userId: bigint): Promise<SessionResponse> {
    const user = await this.prisma.usuarios.findUnique({
      where: { id_usuario: userId },
    });

    if (!user || !user.activo) {
      throw new UnauthorizedException('Token invalido');
    }

    const empresas = await this.tenancyService.getUserEmpresas(userId);
    let empresaActivaId = await this.tenancyService.getActiveEmpresaId(userId);

    if (
      empresaActivaId &&
      !empresas.some((empresa) => empresa.id === empresaActivaId)
    ) {
      await this.tenancyService.clearActiveEmpresa(userId);
      empresaActivaId = null;
    }

    if (!empresaActivaId && empresas.length === 1) {
      const selected = BigInt(empresas[0].id);
      await this.tenancyService.setActiveEmpresa(userId, selected);
      empresaActivaId = empresas[0].id;
    }

    return {
      user: {
        id: user.id_usuario.toString(),
        email: user.email,
        nombre: user.nombre,
        telefono: user.telefono ?? null,
      },
      empresas,
      empresa_activa_id: empresaActivaId,
    };
  }
}
