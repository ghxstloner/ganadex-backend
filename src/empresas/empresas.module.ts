import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { TenancyModule } from '../tenancy/tenancy.module';
import { EmpresasController } from './empresas.controller';
import { EmpresasService } from './empresas.service';

@Module({
  imports: [AuthModule, PrismaModule, TenancyModule],
  controllers: [EmpresasController],
  providers: [EmpresasService],
})
export class EmpresasModule {}
