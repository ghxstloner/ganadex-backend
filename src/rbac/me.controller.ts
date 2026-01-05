import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthService } from '../auth/auth.service';
import { getUserIdFromRequest } from '../common/utils/get-user-id';
import { parseBigInt } from '../common/utils/parse-bigint';
import { RbacService } from './rbac.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class MeController {
  constructor(
    private readonly authService: AuthService,
    private readonly rbacService: RbacService,
  ) {}

  @Get('me')
  async getProfile(@Req() request: Request) {
    const userId = getUserIdFromRequest(request);
    const session = await this.authService.getSession(userId);
    const permissions = session.empresa_activa_id
      ? await this.rbacService.getUserPermissions(
          userId,
          parseBigInt(session.empresa_activa_id, 'empresa_activa_id'),
        )
      : [];

    return {
      ...session,
      permissions: session.empresa_activa_id ? permissions : [],
    };
  }
}
