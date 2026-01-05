import 'dotenv/config'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../generated/prisma'

function createAdapter(databaseUrl: string) {
  const url = new URL(databaseUrl)
  const protocol = url.protocol.replace(':', '')
  if (protocol !== 'mysql' && protocol !== 'mariadb') {
    throw new Error('DATABASE_URL must be mysql or mariadb')
  }

  const connectionLimitParam = url.searchParams.get('connection_limit')
  const connectionLimit = connectionLimitParam ? Number(connectionLimitParam) : 5
  const database = url.pathname.replace('/', '')

  return new PrismaMariaDb({
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database,
    connectionLimit,
  })
}

const databaseUrl = process.env.DATABASE_URL ?? ''
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required')
}

const adapter = createAdapter(databaseUrl)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Iniciando sembrado de base de datos...')

  // 1. Monedas
  await prisma.$executeRawUnsafe(`
    INSERT INTO monedas (codigo, nombre, simbolo) VALUES
      ('COP','Peso colombiano','$'),
      ('USD','Dólar estadounidense','$'),
      ('VES','Bolívar venezolano','Bs.')
    ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), simbolo=VALUES(simbolo);
  `)

  // 2. Ambitos Rol
  await prisma.$executeRawUnsafe(`
    INSERT INTO ambitos_rol (codigo, nombre) VALUES
      ('empresa','Empresa'),
      ('finca','Finca')
    ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);
  `)

  // 4. Tipos Transacción
  await prisma.$executeRawUnsafe(`
    INSERT INTO tipos_transaccion (empresa_id, codigo, nombre) VALUES
      (NULL,'ingreso','Ingreso'),
      (NULL,'gasto','Gasto')
    ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);
  `)

  // 5. Tipos Identificación
  await prisma.$executeRawUnsafe(`
    INSERT INTO tipos_identificacion (empresa_id, codigo, nombre) VALUES
      (NULL,'hierro_lomo','Hierro / marca'),
      (NULL,'arete','Arete'),
      (NULL,'tatuaje_oreja','Tatuaje en oreja'),
      (NULL,'microchip','Microchip')
    ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);
  `)

  // 6. Estados Animales
  await prisma.$executeRawUnsafe(`
    INSERT INTO estados_animales (empresa_id, codigo, nombre, activo) VALUES
      (NULL,'activo','Activo',1),
      (NULL,'vendido','Vendido',1),
      (NULL,'muerto','Muerto',1)
    ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), activo=VALUES(activo);
  `)

  // 7. Categorías Animales
  await prisma.$executeRawUnsafe(`
    INSERT INTO categorias_animales (empresa_id, codigo, nombre, sexo_requerido, activo, orden) VALUES
      (NULL,'becerro','Becerro','M',1,10),
      (NULL,'becerra','Becerra','F',1,11),
      (NULL,'mauto','Mauto','M',1,20),
      (NULL,'mauta','Mauta','F',1,21),
      (NULL,'novillo','Novillo','M',1,30),
      (NULL,'novilla','Novilla','F',1,31),
      (NULL,'vaca','Vaca','F',1,40),
      (NULL,'toro','Toro','M',1,41)
    ON DUPLICATE KEY UPDATE
      nombre=VALUES(nombre), sexo_requerido=VALUES(sexo_requerido),
      activo=VALUES(activo), orden=VALUES(orden);
  `)

  // 8. Tipos Evento Reproductivo
  await prisma.$executeRawUnsafe(`
    INSERT INTO tipos_evento_reproductivo (empresa_id, codigo, nombre) VALUES
      (NULL,'celo','Celo'),
      (NULL,'servicio','Servicio / Monta / Inseminación'),
      (NULL,'palpacion','Palpación'),
      (NULL,'parto','Parto'),
      (NULL,'aborto','Aborto')
    ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);
  `)

  // 9. Resultados Palpación
  await prisma.$executeRawUnsafe(`
    INSERT INTO resultados_palpacion (empresa_id, codigo, nombre) VALUES
      (NULL,'prenada','Preñada'),
      (NULL,'vacia','Vacía'),
      (NULL,'dudosa','Dudosa')
    ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);
  `)

  // 10. Motivos Movimiento
  await prisma.$executeRawUnsafe(`
    INSERT INTO motivos_movimiento (empresa_id, codigo, nombre) VALUES
      (NULL,'rotacion','Rotación'),
      (NULL,'destete','Destete'),
      (NULL,'secado','Secado'),
      (NULL,'fuga','Fuga'),
      (NULL,'ajuste_inventario','Ajuste de inventario')
    ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);
  `)

  // 11. Turnos Ordeño
  await prisma.$executeRawUnsafe(`
    INSERT INTO turnos_ordenio (empresa_id, codigo, nombre) VALUES
      (NULL,'manana','Mañana'),
      (NULL,'tarde','Tarde')
    ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);
  `)

  // 12. Métodos Auditoría
  await prisma.$executeRawUnsafe(`
    INSERT INTO metodos_auditoria (empresa_id, codigo, nombre) VALUES
      (NULL,'conteo_manual','Conteo manual'),
      (NULL,'lector_chip','Lector de microchip')
    ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);
  `)

  // 13. Tipos Adjunto
  await prisma.$executeRawUnsafe(`
    INSERT INTO tipos_adjunto (empresa_id, codigo, nombre) VALUES
      (NULL,'foto_factura','Foto de factura'),
      (NULL,'pdf','PDF'),
      (NULL,'imagen','Imagen'),
      (NULL,'otro','Otro')
    ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);
  `)

  // 14. Estados Productivos
  await prisma.$executeRawUnsafe(`
    INSERT INTO estados_productivos (empresa_id, codigo, nombre, activo, orden) VALUES
      (NULL,'en_ordenio','En ordeño',1,10),
      (NULL,'seca','Seca',1,20),
      (NULL,'levante','Levante',1,30),
      (NULL,'ceba','Ceba',1,40)
    ON DUPLICATE KEY UPDATE
      nombre=VALUES(nombre), activo=VALUES(activo), orden=VALUES(orden);
  `)

  // 15. Tipos Recordatorio
  await prisma.$executeRawUnsafe(`
    INSERT INTO tipos_recordatorio (empresa_id, codigo, nombre) VALUES
      (NULL,'retiro_leche','Retiro de leche'),
      (NULL,'retiro_carne','Retiro de carne'),
      (NULL,'vacuna','Vacunación'),
      (NULL,'palpacion','Palpación / chequeo'),
      (NULL,'destete','Destete'),
      (NULL,'otro','Otro')
    ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);
  `)

  // 16. Estados Recordatorio
  await prisma.$executeRawUnsafe(`
    INSERT INTO estados_recordatorio (codigo, nombre, orden) VALUES
      ('pendiente','Pendiente',1),
      ('completado','Completado',2),
      ('cancelado','Cancelado',3)
    ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), orden=VALUES(orden);
  `)

  // 17. Permisos globales (RBAC)
  await prisma.$executeRawUnsafe(`
    INSERT INTO permisos (codigo, nombre, descripcion) VALUES
      ('PERFIL_LEER','Ver perfil','Acceder al perfil propio'),
      ('PERMISOS_LEER','Ver permisos','Listar catalogo de permisos'),
      ('ROLES_LEER','Ver roles','Listar roles de la empresa'),
      ('ROLES_CREAR','Crear roles','Crear roles en la empresa'),
      ('ROLES_EDITAR','Editar roles','Editar roles y permisos'),
      ('ROLES_ELIMINAR','Eliminar roles','Eliminar roles de la empresa'),
      ('USUARIOS_LEER','Ver usuarios','Listar usuarios de la empresa'),
      ('USUARIOS_CREAR','Crear usuarios','Invitar o crear usuarios'),
      ('USUARIOS_EDITAR','Editar usuarios','Editar datos del usuario'),
      ('USUARIOS_CAMBIAR_ROL','Cambiar rol','Asignar roles a usuarios'),
      ('USUARIOS_ELIMINAR','Eliminar usuarios','Remover usuarios de la empresa')
    ON DUPLICATE KEY UPDATE
      nombre=VALUES(nombre),
      descripcion=VALUES(descripcion);
  `)

  console.log('Sembrado completado correctamente.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
