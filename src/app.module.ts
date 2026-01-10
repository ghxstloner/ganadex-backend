import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { EmpresasModule } from './empresas/empresas.module';
import { FincasModule } from './fincas/fincas.module';
import { PrismaModule } from './prisma/prisma.module';
import { RbacModule } from './rbac/rbac.module';
import { AnimalesModule } from './animales/animales.module';
import { MovimientosModule } from './movimientos/movimientos.module';
import { PotrerosModule } from './potreros/potreros.module';
import { LotesModule } from './lotes/lotes.module';
import { ReproduccionModule } from './reproduccion/reproduccion.module';
import { SaludModule } from './salud/salud.module';
import { LecheModule } from './leche/leche.module';
import { FinanzasModule } from './finanzas/finanzas.module';
import { AuditoriasModule } from './auditorias/auditorias.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.development'],
    }),
    PrismaModule,
    AuthModule,
    EmpresasModule,
    FincasModule,
    RbacModule,
    AnimalesModule,
    MovimientosModule,
    PotrerosModule,
    LotesModule,
    ReproduccionModule,
    SaludModule,
    LecheModule,
    FinanzasModule,
    AuditoriasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
