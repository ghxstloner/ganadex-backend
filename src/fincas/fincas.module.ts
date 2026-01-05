import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { TenancyModule } from '../tenancy/tenancy.module';
import { FincasController } from './fincas.controller';
import { FincasService } from './fincas.service';

@Module({
  imports: [AuthModule, PrismaModule, TenancyModule],
  controllers: [FincasController],
  providers: [FincasService],
})
export class FincasModule {}
