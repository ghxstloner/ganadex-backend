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
import { UserCreateDto } from './dto/user-create.dto';
import { UserRoleUpdateDto } from './dto/user-role-update.dto';
import { UserUpdateDto } from './dto/user-update.dto';
import { RequirePermissions } from './permissions.decorator';
import { PermissionsGuard } from './permissions.guard';
import { UsuariosService } from './usuarios.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  @RequirePermissions('USUARIOS_LEER')
  async list(@EmpresaActivaId() empresaId: bigint) {
    return this.usuariosService.list(empresaId);
  }

  @Post()
  @RequirePermissions('USUARIOS_CREAR')
  async create(
    @EmpresaActivaId() empresaId: bigint,
    @Body() dto: UserCreateDto,
  ) {
    return this.usuariosService.create(empresaId, dto);
  }

  @Patch(':id')
  @RequirePermissions('USUARIOS_EDITAR')
  async update(
    @EmpresaActivaId() empresaId: bigint,
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() dto: UserUpdateDto,
  ) {
    return this.usuariosService.update(empresaId, id, dto);
  }

  @Patch(':id/rol')
  @RequirePermissions('USUARIOS_CAMBIAR_ROL')
  async updateRole(
    @EmpresaActivaId() empresaId: bigint,
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() dto: UserRoleUpdateDto,
  ) {
    return this.usuariosService.updateRole(empresaId, id, dto);
  }

  @Delete(':id')
  @RequirePermissions('USUARIOS_ELIMINAR')
  async remove(
    @EmpresaActivaId() empresaId: bigint,
    @Param('id', ParseBigIntPipe) id: bigint,
  ) {
    return this.usuariosService.remove(empresaId, id);
  }
}
