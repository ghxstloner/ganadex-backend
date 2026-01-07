import { Module } from '@nestjs/common';
import { LecheController } from './leche.controller';
import { LecheService } from './leche.service';
import { AuthModule } from '../auth/auth.module';
import { TenancyModule } from '../tenancy/tenancy.module';

@Module({
    imports: [AuthModule, TenancyModule],
    controllers: [LecheController],
    providers: [LecheService],
    exports: [LecheService],
})
export class LecheModule { }
