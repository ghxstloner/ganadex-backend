import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

type EmpresaResponse = {
  id: string;
  nombre: string;
  rol_id?: string;
  rol_nombre?: string;
};

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
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
      throw new ConflictException('El correo ya está registrado');
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

    const empresas: EmpresaResponse[] = [];

    if (dto.empresa_id || dto.empresa_nombre) {
      const empresa = await this.resolveEmpresa(dto.empresa_id, dto.empresa_nombre);
      const rol = await this.resolveDefaultRol();

      await this.prisma.usuario_empresas.create({
        data: {
          id_usuario: createdUser.id_usuario,
          id_empresa: empresa.id_empresa,
          id_rol: rol.id_rol,
          estado: 'activo',
        },
      });

      empresas.push({
        id: empresa.id_empresa.toString(),
        nombre: empresa.nombre,
        rol_id: rol.id_rol.toString(),
        rol_nombre: rol.nombre,
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
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!passwordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const relaciones = await this.prisma.usuario_empresas.findMany({
      where: {
        id_usuario: user.id_usuario,
        estado: 'activo',
      },
      include: {
        empresas: true,
        roles: true,
      },
    });

    const empresas = relaciones.map((rel) => ({
      id: rel.empresas.id_empresa.toString(),
      nombre: rel.empresas.nombre,
      rol_id: rel.roles?.id_rol?.toString(),
      rol_nombre: rel.roles?.nombre,
    }));

    const empresaActivaSugerida =
      empresas.length === 1 ? empresas[0].id : null;

    const accessToken = await this.signToken(user.id_usuario, email);

    return {
      user: {
        id: user.id_usuario.toString(),
        email: user.email,
        nombre: user.nombre,
      },
      empresas,
      empresa_activa_sugerida: empresaActivaSugerida,
      access_token: accessToken,
    };
  }

  private async signToken(userId: bigint, email: string) {
    return this.jwtService.signAsync({
      sub: userId.toString(),
      email,
      // TODO: Include empresa activa when refresh tokens/session model exists.
    });
  }

  private async resolveEmpresa(
    empresaId?: string,
    empresaNombre?: string,
  ) {
    if (empresaId) {
      const parsedId = this.parseBigInt(empresaId, 'empresa_id');
      const empresa = await this.prisma.empresas.findUnique({
        where: { id_empresa: parsedId },
      });
      if (!empresa) {
        throw new NotFoundException('Empresa no encontrada');
      }
      return empresa;
    }

    if (!empresaNombre) {
      throw new BadRequestException('Datos de empresa requeridos');
    }

    return this.prisma.empresas.create({
      data: {
        nombre: empresaNombre,
      },
    });
  }

  private async resolveDefaultRol() {
    const adminRole = await this.prisma.roles.findFirst({
      where: { codigo: 'admin' },
    });

    if (adminRole) {
      return adminRole;
    }

    const fallback = await this.prisma.roles.findFirst({
      orderBy: { id_rol: 'asc' },
    });

    if (!fallback) {
      throw new BadRequestException(
        'No hay roles disponibles para asignar al usuario',
      );
    }

    return fallback;
  }

  private parseBigInt(value: string, field: string) {
    try {
      return BigInt(value);
    } catch {
      throw new BadRequestException(`${field} inválido`);
    }
  }
}
