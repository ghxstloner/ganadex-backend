import { Module } from '@nestjs/common';
import { OcupacionesController } from './ocupaciones.controller';
import { OcupacionesService } from './ocupaciones.service';
import { AuthModule } from '../auth/auth.module';
import { TenancyModule } from '../tenancy/tenancy.module';

@Module({
  imports: [AuthModule, TenancyModule],
  controllers: [OcupacionesController],
  providers: [OcupacionesService],
  exports: [OcupacionesService],
})
export class OcupacionesModule {}
