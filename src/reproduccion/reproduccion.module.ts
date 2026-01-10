import { Module } from '@nestjs/common';
import { ReproduccionController } from './reproduccion.controller';
import { ReproduccionService } from './reproduccion.service';
import { AuthModule } from '../auth/auth.module';
import { TenancyModule } from '../tenancy/tenancy.module';

@Module({
  imports: [AuthModule, TenancyModule],
  controllers: [ReproduccionController],
  providers: [ReproduccionService],
  exports: [ReproduccionService],
})
export class ReproduccionModule {}
