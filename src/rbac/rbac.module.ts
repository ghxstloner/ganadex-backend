import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { TenancyModule } from '../tenancy/tenancy.module';
import { MeController } from './me.controller';
import { PermisosController } from './permisos.controller';
import { PermissionsGuard } from './permissions.guard';
import { RbacService } from './rbac.service';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';

@Module({
  imports: [PrismaModule, TenancyModule, AuthModule],
  controllers: [
    MeController,
    PermisosController,
    RolesController,
    UsuariosController,
  ],
  providers: [RbacService, RolesService, UsuariosService, PermissionsGuard],
})
export class RbacModule {}
