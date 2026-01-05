<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Auth (Register / Login)

### Environment variables

```bash
JWT_ACCESS_SECRET=your-secret
JWT_ACCESS_EXPIRES_IN=15m
DATABASE_URL="mysql://user:pass@host:3306/dbname"
```

### Endpoints

```bash
# Register (creates user and optional empresa relation)
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "nombre": "Nombre Apellido",
    "telefono": "5551234",
    "password": "supersecret",
    "empresa_id": "1"
  }'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "supersecret"
  }'
```

## SaaS Session Contracts (Multi-Tenant)

### POST /auth/login

Request:

```json
{
  "email": "user@example.com",
  "password": "supersecret"
}
```

Response 200:

```json
{
  "access_token": "jwt",
  "user": {
    "id": "1",
    "email": "user@example.com",
    "nombre": "Nombre Apellido",
    "telefono": "5551234"
  },
  "empresas": [
    {
      "id": "1",
      "nombre": "Empresa Demo",
      "logo_url": null,
      "rol_id": "1",
      "rol_nombre": "Owner"
    }
  ],
  "empresa_activa_id": "1"
}
```

Reglas:
- Si el usuario tiene una sola empresa, se marca como activa y se devuelve su id.
- Si tiene mas de una y aun no selecciona, `empresa_activa_id` es `null`.

### GET /auth/session (Bearer)

Response 200 (misma estructura de sesion):

```json
{
  "user": {
    "id": "1",
    "email": "user@example.com",
    "nombre": "Nombre Apellido",
    "telefono": "5551234"
  },
  "empresas": [
    {
      "id": "1",
      "nombre": "Empresa Demo",
      "logo_url": null,
      "rol_id": "1",
      "rol_nombre": "Owner"
    }
  ],
  "empresa_activa_id": "1"
}
```

### POST /auth/empresa-activa (Bearer)

Request:

```json
{
  "empresa_id": "1"
}
```

Response 200: misma estructura de sesion.

### Empresas

- `GET /empresas` devuelve solo las empresas del usuario.
- `POST /empresas` crea una empresa y la asigna al usuario como owner.
- `PATCH /empresas/:id` requiere empresa activa y el id debe coincidir.

Respuesta `GET /empresas`:

```json
[
  {
    "id": "1",
    "nombre": "Empresa Demo",
    "logo_url": null,
    "rol_id": "1",
    "rol_nombre": "Owner"
  }
]
```

Request `POST /empresas`:

```json
{
  "nombre": "Empresa Demo",
  "documento_fiscal": "J-123",
  "notas": "Notas opcionales"
}
```

Response `POST /empresas` / `PATCH /empresas/:id`:

```json
{
  "id": "1",
  "nombre": "Empresa Demo",
  "documento_fiscal": "J-123",
  "estado": "activa",
  "notas": "Notas opcionales",
  "logo_url": null
}
```

### Fincas

- `GET /fincas?empresa_id=` requiere empresa activa (si se envia `empresa_id`, debe coincidir).
- `POST /fincas` requiere empresa activa o `empresa_id`.
- `PATCH /fincas/:id` requiere empresa activa.

Response `GET /fincas`:

```json
[
  {
    "id": "10",
    "empresa_id": "1",
    "nombre": "Finca Norte",
    "area_hectareas": "45.50",
    "moneda_base_id": "1",
    "direccion": "Ruta 5",
    "notas": null
  }
]
```

Request `POST /fincas`:

```json
{
  "nombre": "Finca Norte",
  "moneda_base_id": "1",
  "area_hectareas": "45.50",
  "direccion": "Ruta 5",
  "notas": "Opcional",
  "empresa_id": "1"
}
```

Response `POST /fincas` / `PATCH /fincas/:id`:

```json
{
  "id": "10",
  "empresa_id": "1",
  "nombre": "Finca Norte",
  "area_hectareas": "45.50",
  "moneda_base_id": "1",
  "direccion": "Ruta 5",
  "notas": "Opcional"
}
```

### Errores

- 401 token invalido
- 403 empresa no pertenece al usuario
- 404 empresa/finca no existe
- 422 validacion

### Notas multi-tenant

- Todas las consultas filtran por `empresa_id`.
- La seleccion activa se persiste en `usuario_empresas.es_activa`.
- Asegura la migracion de la columna `es_activa` en `usuario_empresas`.

### Notes

- `usuarios.password_hash` must be set for login (users without password are rejected).
- `usuario_empresas.id_rol` is required; ensure at least one `roles` row exists before registering with `empresa_id` or `empresa_nombre`.
- Refresh tokens are not implemented yet (TODOs are in the auth service).

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
