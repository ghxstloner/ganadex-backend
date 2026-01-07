import { Module } from '@nestjs/common';
import { AuditoriasController } from './auditorias.controller';
import { AuditoriasService } from './auditorias.service';
import { AuthModule } from '../auth/auth.module';
import { TenancyModule } from '../tenancy/tenancy.module';

@Module({
    imports: [AuthModule, TenancyModule],
    controllers: [AuditoriasController],
    providers: [AuditoriasService],
    exports: [AuditoriasService],
})
export class AuditoriasModule { }
