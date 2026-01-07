import { Module } from '@nestjs/common';
import { FinanzasController } from './finanzas.controller';
import { FinanzasService } from './finanzas.service';
import { AuthModule } from '../auth/auth.module';
import { TenancyModule } from '../tenancy/tenancy.module';

@Module({
    imports: [AuthModule, TenancyModule],
    controllers: [FinanzasController],
    providers: [FinanzasService],
    exports: [FinanzasService],
})
export class FinanzasModule { }
