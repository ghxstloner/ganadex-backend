import { Module } from '@nestjs/common';
import { SaludController } from './salud.controller';
import { SaludService } from './salud.service';
import { AuthModule } from '../auth/auth.module';
import { TenancyModule } from '../tenancy/tenancy.module';

@Module({
    imports: [AuthModule, TenancyModule],
    controllers: [SaludController],
    providers: [SaludService],
    exports: [SaludService],
})
export class SaludModule { }
