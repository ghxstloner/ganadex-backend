import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermissions } from './permissions.decorator';
import { PermissionsGuard } from './permissions.guard';
import { RbacService } from './rbac.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('permisos')
export class PermisosController {
  constructor(private readonly rbacService: RbacService) {}

  @Get()
  @RequirePermissions('PERMISOS_LEER')
  async list() {
    return this.rbacService.getPermissionsCatalog();
  }
}
