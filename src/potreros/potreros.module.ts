import { Module } from '@nestjs/common';
import { PotrerosController } from './potreros.controller';
import { PotrerosService } from './potreros.service';
import { AuthModule } from '../auth/auth.module';
import { TenancyModule } from '../tenancy/tenancy.module';

@Module({
    imports: [AuthModule, TenancyModule],
    controllers: [PotrerosController],
    providers: [PotrerosService],
    exports: [PotrerosService],
})
export class PotrerosModule { }
