import { Module } from '@nestjs/common';
import { MovimientosController } from './movimientos.controller';
import { MovimientosService } from './movimientos.service';
import { AuthModule } from '../auth/auth.module';
import { TenancyModule } from '../tenancy/tenancy.module';

@Module({
  imports: [AuthModule, TenancyModule],
  controllers: [MovimientosController],
  providers: [MovimientosService],
  exports: [MovimientosService],
})
export class MovimientosModule {}
