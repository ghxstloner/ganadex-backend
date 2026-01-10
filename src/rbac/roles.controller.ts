import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ParseBigIntPipe } from '../common/pipes/parse-bigint.pipe';
import { EmpresaActivaId } from './empresa-activa.decorator';
import { RoleCreateDto } from './dto/role-create.dto';
import { RoleUpdateDto } from './dto/role-update.dto';
import { RequirePermissions } from './permissions.decorator';
import { PermissionsGuard } from './permissions.guard';
import { RolesService } from './roles.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @RequirePermissions('ROLES_LEER')
  async list(@EmpresaActivaId() empresaId: bigint) {
    return this.rolesService.list(empresaId);
  }

  @Post()
  @RequirePermissions('ROLES_CREAR')
  async create(
    @EmpresaActivaId() empresaId: bigint,
    @Body() dto: RoleCreateDto,
  ) {
    return this.rolesService.create(empresaId, dto);
  }

  @Patch(':id')
  @RequirePermissions('ROLES_EDITAR')
  async update(
    @EmpresaActivaId() empresaId: bigint,
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() dto: RoleUpdateDto,
  ) {
    return this.rolesService.update(empresaId, id, dto);
  }

  @Delete(':id')
  @RequirePermissions('ROLES_ELIMINAR')
  async remove(
    @EmpresaActivaId() empresaId: bigint,
    @Param('id', ParseBigIntPipe) id: bigint,
  ) {
    return this.rolesService.remove(empresaId, id);
  }
}
