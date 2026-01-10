import { Module } from '@nestjs/common';
import { AnimalesController } from './animales.controller';
import { AnimalesService } from './animales.service';
import { IdentificacionesController } from './identificaciones/identificaciones.controller';
import { IdentificacionesService } from './identificaciones/identificaciones.service';
import { AuthModule } from '../auth/auth.module';
import { TenancyModule } from '../tenancy/tenancy.module';

@Module({
  imports: [AuthModule, TenancyModule],
  controllers: [AnimalesController, IdentificacionesController],
  providers: [AnimalesService, IdentificacionesService],
  exports: [AnimalesService],
})
export class AnimalesModule {}
