import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { parseBigInt } from '../common/utils/parse-bigint';
import { TenancyService } from '../tenancy/tenancy.service';
import { PERMISSIONS_KEY } from './permissions.decorator';
import { RbacService } from './rbac.service';

type RequestWithAuth = Request & { user?: JwtPayload; empresaId?: bigint };

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rbacService: RbacService,
    private readonly tenancyService: TenancyService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const requiredPermissions =
      this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (!requiredPermissions.length) {
      return true;
    }

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

    request.empresaId = empresaId;

    const userPermissions = await this.rbacService.getUserPermissions(
      userId,
      empresaId,
    );
    const missing = requiredPermissions.filter(
      (permission) => !userPermissions.includes(permission),
    );

    if (missing.length) {
      throw new ForbiddenException('Permisos insuficientes');
    }

    return true;
  }
}
