import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const corsOrigins = (configService.get<string>('CORS_ORIGIN') ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({
    origin: corsOrigins.length ? corsOrigins : false,
    credentials: true,
  });

  // Servir archivos estáticos desde la carpeta uploads
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // Global pipes, filters, interceptors
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      errorHttpStatusCode: 422,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Swagger configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Ganadex API')
    .setDescription('API para gestión ganadera multi-tenant')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT-auth',
    )
    .addTag('Auth', 'Autenticación y sesión')
    .addTag('Empresas', 'Gestión de empresas')
    .addTag('Fincas', 'Gestión de fincas')
    .addTag('RBAC', 'Roles y permisos')
    .addTag('Animales', 'Gestión de animales')
    .addTag('Identificaciones', 'Identificaciones de animales')
    .addTag('Movimientos', 'Movimientos de animales')
    .addTag('Potreros', 'Gestión de potreros')
    .addTag('Lotes', 'Gestión de lotes')
    .addTag('Ocupación', 'Ocupación de potreros')
    .addTag('Reproducción', 'Eventos reproductivos')
    .addTag('Salud', 'Eventos sanitarios y retiros')
    .addTag('Leche', 'Producción y entregas de leche')
    .addTag('Finanzas', 'Transacciones financieras')
    .addTag('Auditorías', 'Auditorías de inventario')
    .addTag('Catálogos', 'Catálogos base del sistema')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Application running on: ${await app.getUrl()}`);
  console.log(`📚 Swagger docs: ${await app.getUrl()}/api/docs`);
}
bootstrap();
