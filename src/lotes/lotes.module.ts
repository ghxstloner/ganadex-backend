import { Module } from '@nestjs/common';
import { LotesController } from './lotes.controller';
import { LotesService } from './lotes.service';
import { AuthModule } from '../auth/auth.module';
import { TenancyModule } from '../tenancy/tenancy.module';

@Module({
  imports: [AuthModule, TenancyModule],
  controllers: [LotesController],
  providers: [LotesService],
  exports: [LotesService],
})
export class LotesModule {}
