# Guía para agentes (Backend)

## Estructura del proyecto

- `src/` contiene el código NestJS (controladores, módulos, servicios, DTOs).
- `test/` contiene pruebas e2e y la configuración `test/jest-e2e.json`.
- `prisma/schema.prisma` define el esquema de base de datos.
- Configuración en `.prettierrc`, `eslint.config.mjs`, `tsconfig*.json`, `nest-cli.json`.

## Comandos de desarrollo, build y lint

- `npm run start`: inicia la app con Nest CLI.
- `npm run start:dev`: modo watch para desarrollo.
- `npm run start:debug`: inicia con inspector.
- `npm run build`: compila a `dist/`.
- `npm run start:prod`: corre desde `dist/`.
- `npm run lint`: ESLint con autofix en `src/`, `apps/`, `libs/`, `test/`.
- `npm run format`: Prettier en `src/**/*.ts` y `test/**/*.ts`.

## Tests

- `npm run test`: Jest unitario (`*.spec.ts`).
- `npm run test:watch`: modo watch.
- `npm run test:cov`: coverage en `coverage/`.
- `npm run test:debug`: Jest con inspector.
- `npm run test:e2e`: e2e con config `test/jest-e2e.json`.

Ejecutar un test específico:
- Archivo: `npm run test -- src/modulo/archivo.spec.ts`
- Por nombre: `npm run test -- -t "nombre del test"`
- E2E por archivo: `npm run test:e2e -- test/mi-caso.e2e-spec.ts`

## Estilo de código y convenciones

- Formato: Prettier con comillas simples y trailing commas.
- ESLint: `eslint.config.mjs` con `recommendedTypeChecked`.
- Imports: agrupar por origen; primero NestJS/externos, luego internos.
- DTOs: `PascalCase` con sufijo `Dto`, validaciones con `class-validator`.
- Campos de DTO: mantener `snake_case` cuando la API lo exige.
- Tipos: preferir tipos explícitos; evita `any` salvo necesidad real.
- BigInt: convertir con helpers (`parseBigInt`) y serializar a string en respuestas.
- Controladores: usan decoradores Nest y delegan lógica a servicios.

## Manejo de errores

- Usa excepciones NestJS (`NotFoundException`, `BadRequestException`, etc.).
- Mensajes claros en español y consistentes en toda la API.
- No usar `throw new Error` genérico.

## Prisma y datos

- Migraciones: `npm run prisma:migrate`.
- Seeds: `npm run prisma:seed` y `npm run db:seed:demo`.
- Mantener `DATABASE_URL` en `.env` local.

## Seguridad

- No commitear `.env` ni secretos.
- Evitar archivos generados en control de versiones.

## Estado funcional actual (referencia)

Leyenda:
- `IMPLEMENTADO`: funcionalidad operativa y evidenciada.
- `PARCIAL`: UI o lógica incompleta / riesgo operativo.
- `NO_IMPLEMENTADO`: no existe implementación funcional.
- `MODELO_SIN_UI`: existe en modelo de datos pero no expuesto funcionalmente.

Resumen por módulo:
- Inventario Animal: registro/identificadores/historial OK; ubicación/auditoría parcial; manga sin implementar.
- Fincas: CRUD OK; multi-finca parcial.
- Potreros y Pastoreo: CRUD y mapas OK; ocupación parcial; historial/rotación/alertas no implementado.
- Lotes: CRUD y asignación OK; trazabilidad parcial.
- Movimientos y Trazabilidad: registro/motivo OK; historial y auditoría parcial/no implementado.
- Reproducción: servicios en modelo; palpaciones, días abiertos, intervalos, semáforo, historial no implementado.
- Sanidad: eventos en modelo; plan de vacunación y medicamentos parcial; retiro/alertas no implementado.
- Producción de Leche: producción en modelo; conciliación e historial no implementado.
- Nacimientos: registro/alertas/impacto inventario no implementado.
- Finanzas: transacciones en modelo; multi-moneda/análisis/integración no implementado.
