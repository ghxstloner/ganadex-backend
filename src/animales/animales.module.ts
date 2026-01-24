import { Module } from '@nestjs/common';
import { AnimalesController } from './animales.controller';
import { AnimalesService } from './animales.service';
import { IdentificacionesController } from './identificaciones/identificaciones.controller';
import { IdentificacionesService } from './identificaciones/identificaciones.service';
import { AuthModule } from '../auth/auth.module';
import { TenancyModule } from '../tenancy/tenancy.module';
import { CommonModule } from '../common/common.module';
import { PrismaModule } from '../prisma/prisma.module';
import { MovimientosModule } from '../movimientos/movimientos.module';

@Module({
  imports: [AuthModule, TenancyModule, CommonModule, PrismaModule, MovimientosModule],
  controllers: [AnimalesController, IdentificacionesController],
  providers: [AnimalesService, IdentificacionesService],
  exports: [AnimalesService, IdentificacionesService],
})
export class AnimalesModule {}
