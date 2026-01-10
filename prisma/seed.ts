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
    INSERT IGNORE INTO \`monedas\` (
      \`id_moneda\`,
      \`iso_alpha3\`,
      \`iso_num\`,
      \`nombre\`,
      \`nombre_plural\`,
      \`simbolo\`,
      \`simbolo_nativo\`,
      \`simbolo_html\`,
      \`unicode_symbol\`,
      \`decimales\`,
      \`subunidad_nombre\`,
      \`subunidad_factor\`,
      \`separador_decimal\`,
      \`separador_miles\`,
      \`formato\`,
      \`redondeo\`,
      \`es_cripto\`,
      \`activo\`,
      \`created_at\`,
      \`updated_at\`
    ) VALUES
    (1,'USD','840','Dólar estadounidense','Dólares estadounidenses','$','$','&dollar;','$',2,'centavo',100,'.',',','{symbol}{amount}',0.000000,0,1,'2025-12-19 16:27:35','2025-12-19 16:27:35'),
    (2,'EUR','978','Euro','Euros','€','€','&euro;','€',2,'céntimo',100,'.',',','{symbol}{amount}',0.000000,0,1,'2025-12-19 16:27:35','2025-12-19 16:27:35'),
    (3,'MXN','484','Peso mexicano','Pesos mexicanos','$','$',NULL,'$',2,'centavo',100,'.',',','{symbol}{amount}',0.000000,0,1,'2025-12-19 16:27:35','2025-12-19 16:27:35'),
    (4,'GTQ','320','Quetzal guatemalteco','Quetzales guatemaltecos','Q','Q',NULL,'Q',2,'centavo',100,'.',',','{symbol}{amount}',0.000000,0,1,'2025-12-19 16:27:35','2025-12-19 16:27:35'),
    (5,'HNL','340','Lempira hondureña','Lempiras hondureñas','L','L',NULL,'L',2,'centavo',100,'.',',','{symbol}{amount}',0.000000,0,1,'2025-12-19 16:27:35','2025-12-19 16:27:35'),
    (6,'NIO','558','Córdoba nicaragüense','Córdobas nicaragüenses','C$','C$',NULL,'C$',2,'centavo',100,'.',',','{symbol}{amount}',0.000000,0,1,'2025-12-19 16:27:35','2025-12-19 16:27:35'),
    (7,'CRC','188','Colón costarricense','Colones costarricenses','₡','₡',NULL,'₡',2,'céntimo',100,'.',',','{symbol}{amount}',0.000000,0,1,'2025-12-19 16:27:35','2025-12-19 16:27:35'),
    (8,'PAB','590','Balboa panameño','Balboas','B/.','B/.',NULL,'B/.',2,'centésimo',100,'.',',','{symbol}{amount}',0.000000,0,1,'2025-12-19 16:27:35','2025-12-19 16:27:35'),
    (9,'BZD','084','Dólar beliceño','Dólares beliceños','BZ$','BZ$',NULL,'BZ$',2,'centavo',100,'.',',','{symbol}{amount}',0.000000,0,1,'2025-12-19 16:27:35','2025-12-19 16:27:35'),
    (10,'SVC','222','Colón salvadoreño','Colones salvadoreños','₡','₡',NULL,'₡',2,'centavo',100,'.',',','{symbol}{amount}',0.000000,0,0,'2025-12-19 16:27:35','2025-12-19 16:27:35'),
    (11,'CUP','192','Peso cubano','Pesos cubanos','$','$',NULL,'$',2,'centavo',100,'.',',','{symbol}{amount}',0.000000,0,1,'2025-12-19 16:27:35','2025-12-19 16:27:35'),
    (12,'DOP','214','Peso dominicano','Pesos dominicanos','RD$','RD$',NULL,'RD$',2,'centavo',100,'.',',','{symbol}{amount}',0.000000,0,1,'2025-12-19 16:27:35','2025-12-19 16:27:35'),
    (13,'HTG','332','Gourde haitiano','Gourdes haitianos','G','G',NULL,'G',2,'céntimo',100,'.',',','{symbol}{amount}',0.000000,0,1,'2025-12-19 16:27:35','2025-12-19 16:27:35'),
    (14,'JMD','388','Dólar jamaiquino','Dólares jamaiquinos','J$','J$',NULL,'J$',2,'centavo',100,'.',',','{symbol}{amount}',0.000000,0,1,'2025-12-19 16:27:35','2025-12-19 16:27:35'),
    (15,'TTD','780','Dólar de Trinidad y Tobago','Dólares de Trinidad y Tobago','TT$','TT$',NULL,'TT$',2,'centavo',100,'.',',','{symbol}{amount}',0.000000,0,1,'2025-12-19 16:27:35','2025-12-19 16:27:35'),
    (16,'BSD','044','Dólar bahameño','Dólares bahameños','B$','B$',NULL,'B$',2,'centavo',100,'.',',','{symbol}{amount}',0.000000,0,1,'2025-12-19 16:27:35','2025-12-19 16:27:35'),
    (17,'BBD','052','Dólar barbadense','Dólares barbadenses','Bds$','Bds$',NULL,'Bds$',2,'centavo',100,'.',',','{symbol}{amount}',0.000000,0,1,'2025-12-19 16:27:35','2025-12-19 16:27:35'),
    (18,'XCD','951','Dólar del Caribe Oriental','Dólares del Caribe Oriental','EC$','EC$',NULL,'EC$',2,'centavo',100,'.',',','{symbol}{amount}',0.000000,0,1,'2025-12-19 16:27:35','2025-12-19 16:27:35'),
    (19,'AWG','533','Florín arubeño','Florines arubeños','Afl.','Afl.',NULL,'ƒ',2,'centavo',100,'.',',','{symbol}{amount}',0.000000,0,1,'2025-12-19 16:27:35','2025-12-19 16:27:35'),
    (20,'ANG','532','Florín antillano neerlandés','Florines antillanos neerlandeses','NAf.','NAf.',NULL,'ƒ',2,'centavo',100,'.',',','{symbol}{amount}',0.000000,0,1,'2025-12-19 16:27:35','2025-12-19 16:27:35'),
    (21,'ARS','032','Peso argentino','Pesos argentinos','$','$',NULL,'$',2,'centavo',100,'.',',','{symbol}{amount}',0.000000,0,1,'2025-12-19 16:27:35','2025-12-19 16:27:35'),
    (22,'BOB','068','Boliviano','Bolivianos','Bs.','Bs.',NULL,'Bs',2,'centavo',100,'.',',','{symbol}{amount}',0.000000,0,1,'2025-12-19 16:27:35','2025-12-19 16:27:35'),
    (23,'BRL','986','Real brasileño','Reales brasileños','R$','R$',NULL,'R$',2,'centavo',100,'.',',','{symbol}{amount}',0.000000,0,1,'2025-12-19 16:27:35','2025-12-19 16:27:35'),
    (24,'CLP','152','Peso chileno','Pesos chilenos','$','$',NULL,'$',0,NULL,1,'.',',','{symbol}{amount}',0.000000,0,1,'2025-12-19 16:27:35','2025-12-19 16:27:35'),
    (25,'COP','170','Peso colombiano','Pesos colombianos','$','$',NULL,'$',2,'centavo',100,'.',',','{symbol}{amount}',0.000000,0,1,'2025-12-19 16:27:35','2025-12-19 16:27:35'),
    (26,'PYG','600','Guaraní paraguayo','Guaraníes paraguayos','₲','₲',NULL,'₲',0,NULL,1,'.',',','{symbol}{amount}',0.000000,0,1,'2025-12-19 16:27:35','2025-12-19 16:27:35'),
    (27,'PEN','604','Sol peruano','Soles peruanos','S/','S/',NULL,'S/',2,'céntimo',100,'.',',','{symbol}{amount}',0.000000,0,1,'2025-12-19 16:27:35','2025-12-19 16:27:35'),
    (28,'UYU','858','Peso uruguayo','Pesos uruguayos','$U','$U',NULL,'$U',2,'centésimo',100,'.',',','{symbol}{amount}',0.000000,0,1,'2025-12-19 16:27:35','2025-12-19 16:27:35'),
    (29,'VES','928','Bolívar soberano','Bolívares soberanos','Bs.','Bs.',NULL,'Bs',2,'céntimo',100,'.',',','{symbol}{amount}',0.000000,0,1,'2025-12-19 16:27:35','2025-12-19 16:27:35'),
    (30,'GYD','328','Dólar guyanés','Dólares guyaneses','G$','G$',NULL,'G$',2,'centavo',100,'.',',','{symbol}{amount}',0.000000,0,1,'2025-12-19 16:27:35','2025-12-19 16:27:35'),
    (31,'SRD','968','Dólar surinamés','Dólares surinameses','$','$',NULL,'$',2,'centavo',100,'.',',','{symbol}{amount}',0.000000,0,1,'2025-12-19 16:27:35','2025-12-19 16:27:35');
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

  // 16.1. Estados Potreros (catálogo global)
  await prisma.$executeRawUnsafe(`
    INSERT INTO estados_potreros (codigo, nombre, orden, activo) VALUES
      ('disponible','Disponible',10,1),
      ('ocupado','Ocupado',20,1),
      ('mantenimiento','Mantenimiento',30,1),
      ('inactivo','Inactivo',40,1)
    ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), orden=VALUES(orden), activo=VALUES(activo);
  `)

  // 17. Tipos de Retiro
  await prisma.$executeRawUnsafe(`
    INSERT INTO tipos_retiro (empresa_id, codigo, nombre) VALUES
      (NULL,'LECHE','Retiro de leche'),
      (NULL,'CARNE','Retiro de carne')
    ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);
  `)

  // 18. Permisos globales (RBAC) - includes new module permissions
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
      ('USUARIOS_ELIMINAR','Eliminar usuarios','Remover usuarios de la empresa'),
      ('ANIMALES_LEER','Ver animales','Listar y consultar animales'),
      ('ANIMALES_CREAR','Crear animales','Registrar nuevos animales'),
      ('ANIMALES_EDITAR','Editar animales','Modificar datos de animales'),
      ('ANIMALES_ELIMINAR','Eliminar animales','Eliminar animales del sistema'),
      ('SALUD_LEER','Ver salud','Consultar eventos sanitarios'),
      ('SALUD_CREAR','Crear eventos salud','Registrar eventos sanitarios'),
      ('SALUD_EDITAR','Editar salud','Modificar eventos sanitarios'),
      ('SALUD_ELIMINAR','Eliminar salud','Eliminar eventos sanitarios'),
      ('REPRODUCCION_LEER','Ver reproduccion','Consultar eventos reproductivos'),
      ('REPRODUCCION_CREAR','Crear reproduccion','Registrar eventos reproductivos'),
      ('REPRODUCCION_EDITAR','Editar reproduccion','Modificar eventos reproductivos'),
      ('REPRODUCCION_ELIMINAR','Eliminar reproduccion','Eliminar eventos reproductivos'),
      ('POTREROS_LEER','Ver potreros','Consultar potreros y lotes'),
      ('POTREROS_CREAR','Crear potreros','Registrar potreros y lotes'),
      ('POTREROS_EDITAR','Editar potreros','Modificar potreros y lotes'),
      ('POTREROS_ELIMINAR','Eliminar potreros','Eliminar potreros y lotes'),
      ('LECHE_LEER','Ver leche','Consultar produccion de leche'),
      ('LECHE_CREAR','Crear entregas','Registrar entregas de leche'),
      ('LECHE_EDITAR','Editar leche','Modificar registros de leche'),
      ('LECHE_ELIMINAR','Eliminar leche','Eliminar registros de leche'),
      ('FINANZAS_LEER','Ver finanzas','Consultar transacciones'),
      ('FINANZAS_CREAR','Crear transacciones','Registrar ingresos y gastos'),
      ('FINANZAS_EDITAR','Editar finanzas','Modificar transacciones'),
      ('FINANZAS_ELIMINAR','Eliminar finanzas','Eliminar transacciones'),
      ('AUDITORIAS_LEER','Ver auditorias','Consultar auditorias'),
      ('AUDITORIAS_CREAR','Crear auditorias','Iniciar auditorias de inventario'),
      ('AUDITORIAS_EDITAR','Editar auditorias','Modificar auditorias')
    ON DUPLICATE KEY UPDATE
      nombre=VALUES(nombre),
      descripcion=VALUES(descripcion);
  `)

  // 19. Categorías Financieras base
  await prisma.$executeRawUnsafe(`
    INSERT INTO categorias_financieras (empresa_id, codigo, nombre, id_tipo_transaccion, activo, orden) VALUES
      (NULL,'venta_leche','Venta de leche',(SELECT id_tipo_transaccion FROM tipos_transaccion WHERE codigo='ingreso' LIMIT 1),1,10),
      (NULL,'venta_ganado','Venta de ganado',(SELECT id_tipo_transaccion FROM tipos_transaccion WHERE codigo='ingreso' LIMIT 1),1,20),
      (NULL,'alimento','Alimento y suplementos',(SELECT id_tipo_transaccion FROM tipos_transaccion WHERE codigo='gasto' LIMIT 1),1,30),
      (NULL,'mano_obra','Mano de obra',(SELECT id_tipo_transaccion FROM tipos_transaccion WHERE codigo='gasto' LIMIT 1),1,40),
      (NULL,'veterinario','Servicios veterinarios',(SELECT id_tipo_transaccion FROM tipos_transaccion WHERE codigo='gasto' LIMIT 1),1,50),
      (NULL,'medicamentos','Medicamentos',(SELECT id_tipo_transaccion FROM tipos_transaccion WHERE codigo='gasto' LIMIT 1),1,60),
      (NULL,'otros_ingresos','Otros ingresos',(SELECT id_tipo_transaccion FROM tipos_transaccion WHERE codigo='ingreso' LIMIT 1),1,100),
      (NULL,'otros_gastos','Otros gastos',(SELECT id_tipo_transaccion FROM tipos_transaccion WHERE codigo='gasto' LIMIT 1),1,110)
    ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), activo=VALUES(activo), orden=VALUES(orden);
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
