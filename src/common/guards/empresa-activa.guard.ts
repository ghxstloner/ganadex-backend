import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtPayload } from '../../auth/strategies/jwt.strategy';
import { parseBigInt } from '../utils/parse-bigint';
import { TenancyService } from '../../tenancy/tenancy.service';

type RequestWithAuth = Request & { user?: JwtPayload; empresaId?: bigint };

@Injectable()
export class EmpresaActivaGuard implements CanActivate {
  constructor(private readonly tenancyService: TenancyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAuth>();
    const payload = request.user;

    if (!payload?.sub) {
      throw new UnauthorizedException('Token invalido');
    }

    const userId = parseBigInt(payload.sub, 'user_id');
    let empresaId: bigint;

    if (payload.empresa_activa_id) {
      empresaId = parseBigInt(payload.empresa_activa_id, 'empresa_activa_id');
      await this.tenancyService.assertEmpresaBelongs(userId, empresaId);
    } else {
      empresaId = await this.tenancyService.requireActiveEmpresaId(userId);
    }

    if (!empresaId) {
      throw new UnprocessableEntityException('Empresa activa requerida');
    }

    request.empresaId = empresaId;
    return true;
  }
}
