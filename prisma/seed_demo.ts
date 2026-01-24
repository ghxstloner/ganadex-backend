// prisma/seed_demo.ts
// Seed DEMO para tu schema actual Ganadex (MySQL) con:
// - Movimientos = fuente de verdad para POTRERO (potrero_destino_id del último movimiento)
// - Lote actual = animales.lote_actual_id (y se actualiza junto al movimiento)
// - Ocupación (ocupacion_potreros) con is_active NOT NULL + historial
//
// Ejecutar:
//   SEED_MODE=demo tsx prisma/seed_demo.ts
//
// Requisitos:
//   npm i -D @faker-js/faker
//   npm i -D tsx
//
// Notas:
// - Faker determinístico (faker.seed)
// - Idempotent-ish: reusa empresa/admin/finca/lotes/potreros por nombre cuando puede.
// - Si tu prisma client no genera algunos "where" compuestos con alias, uso fallback con findFirst + update/create.

import 'dotenv/config'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../generated/prisma'
import { faker } from '@faker-js/faker'

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
if (!databaseUrl) throw new Error('DATABASE_URL is required')

const adapter = createAdapter(databaseUrl)
const prisma = new PrismaClient({ adapter })

// -----------------------------
// Config DEMO
// -----------------------------
const DEMO = {
  empresaNombre: 'GANADEX Demo Ranch',
  empresaDocumento: 'J-123456-789',
  adminEmail: 'admin@ganadex.demo',
  adminNombre: 'Admin Demo',
  fincaNombre: 'Finca La Esperanza',
  centroRecepcionNombre: 'Centro Lechero Central',

  // Tamaños de data
  lotesCount: 10,
  potrerosCount: 40,
  animalesCount: 320,

  // Movimientos
  movimientosExtraPorAnimalMin: 1,
  movimientosExtraPorAnimalMax: 4,

  // Producción
  diasProduccion: 90,

  // Finanzas
  transaccionesCount: 80,
}

// -----------------------------
// Utils
// -----------------------------
function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(0, 0, 0, 0)
  return d
}

function dateOnly(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function randPick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randInt(min: number, max: number) {
  return faker.number.int({ min, max })
}

function to2(n: number) {
  return Math.round(n * 100) / 100
}

function decimal(n: number) {
  return n as any
}

// Square polygon for geometry
function squarePolygon(lon: number, lat: number, meters: number) {
  const dLat = meters / 111000
  const dLon = meters / (111000 * Math.cos((lat * Math.PI) / 180))
  const p = [
    [lon - dLon, lat - dLat],
    [lon + dLon, lat - dLat],
    [lon + dLon, lat + dLat],
    [lon - dLon, lat + dLat],
    [lon - dLon, lat - dLat],
  ]
  return { type: 'Polygon', coordinates: [p] }
}

async function ensureMonedas() {
  const base = [
    {
      iso_alpha3: 'COP',
      iso_num: '170',
      nombre: 'Peso colombiano',
      nombre_plural: 'Pesos colombianos',
      simbolo: '$',
      simbolo_nativo: '$',
      simbolo_html: '&#36;',
      unicode_symbol: '$',
      decimales: 2,
      subunidad_nombre: 'centavo',
      subunidad_factor: 100,
      separador_decimal: '.',
      separador_miles: ',',
      formato: '$ #,##0.00',
      redondeo: decimal(0),
      es_cripto: false,
      activo: true,
    },
    {
      iso_alpha3: 'USD',
      iso_num: '840',
      nombre: 'Dólar estadounidense',
      nombre_plural: 'Dólares estadounidenses',
      simbolo: '$',
      simbolo_nativo: '$',
      simbolo_html: '&#36;',
      unicode_symbol: '$',
      decimales: 2,
      subunidad_nombre: 'cent',
      subunidad_factor: 100,
      separador_decimal: '.',
      separador_miles: ',',
      formato: '$ #,##0.00',
      redondeo: decimal(0),
      es_cripto: false,
      activo: true,
    },
  ]

  for (const m of base) {
    const exists = await prisma.monedas.findUnique({ where: { iso_alpha3: m.iso_alpha3 } })
    if (!exists) {
      await prisma.monedas.create({ data: m as any })
    }
  }

  const monedaCOP = await prisma.monedas.findUnique({ where: { iso_alpha3: 'COP' } })
  const monedaUSD = await prisma.monedas.findUnique({ where: { iso_alpha3: 'USD' } })
  if (!monedaCOP || !monedaUSD) throw new Error('No se pudieron asegurar monedas COP/USD')
  return { monedaCOP, monedaUSD }
}

async function ensureEstadosPotreros() {
  const base = [
    { codigo: 'disponible', nombre: 'Disponible', orden: 1, activo: true },
    { codigo: 'ocupado', nombre: 'Ocupado', orden: 2, activo: true },
    { codigo: 'mantenimiento', nombre: 'En mantenimiento', orden: 3, activo: true },
  ]

  for (const e of base) {
    const exists = await prisma.estados_potreros.findUnique({ where: { codigo: e.codigo } }).catch(() => null)
    if (!exists) await prisma.estados_potreros.create({ data: e as any })
  }

  const all = await prisma.estados_potreros.findMany()
  if (!all.length) throw new Error('No se pudieron asegurar estados_potreros')
  return all
}

async function ensureAmbitosRol() {
  const base = [
    { codigo: 'empresa', nombre: 'Ámbito Empresa' },
    { codigo: 'finca', nombre: 'Ámbito Finca' },
  ]

  for (const a of base) {
    const exists = await prisma.ambitos_rol.findUnique({ where: { codigo: a.codigo } }).catch(() => null)
    if (!exists) await prisma.ambitos_rol.create({ data: a as any })
  }

  const ambitoEmpresa = await prisma.ambitos_rol.findUnique({ where: { codigo: 'empresa' } })
  const ambitoFinca = await prisma.ambitos_rol.findUnique({ where: { codigo: 'finca' } })
  if (!ambitoEmpresa || !ambitoFinca) throw new Error('No se pudieron asegurar ambitos_rol')
  return { ambitoEmpresa, ambitoFinca }
}

async function ensureTiposTransaccion() {
  const base = [
    { codigo: 'ingreso', nombre: 'Ingreso' },
    { codigo: 'gasto', nombre: 'Gasto' },
  ]
  for (const t of base) {
    const exists = await prisma.tipos_transaccion.findFirst({ where: { codigo: t.codigo } })
    if (!exists) await prisma.tipos_transaccion.create({ data: t as any })
  }
  const tipoTxIngreso = await prisma.tipos_transaccion.findFirst({ where: { codigo: 'ingreso' } })
  const tipoTxGasto = await prisma.tipos_transaccion.findFirst({ where: { codigo: 'gasto' } })
  if (!tipoTxIngreso || !tipoTxGasto) throw new Error('No se pudieron asegurar tipos_transaccion')
  return { tipoTxIngreso, tipoTxGasto }
}

async function ensureMotivosMovimiento() {
  const base = [
    { codigo: 'ALTA', nombre: 'Alta / Ingreso' },
    { codigo: 'TRASLADO', nombre: 'Traslado' },
    { codigo: 'SANITARIO', nombre: 'Movimiento por Salud' },
    { codigo: 'REPRO', nombre: 'Movimiento Reproductivo' },
    { codigo: 'VENTA', nombre: 'Venta / Salida' },
  ]
  for (const m of base) {
    const exists = await prisma.motivos_movimiento.findFirst({ where: { codigo: m.codigo } })
    if (!exists) await prisma.motivos_movimiento.create({ data: m as any })
  }
  const all = await prisma.motivos_movimiento.findMany()
  if (!all.length) throw new Error('No se pudieron asegurar motivos_movimiento')
  return all
}

async function ensureTiposIdentificacion() {
  const base = [
    { codigo: 'arete', nombre: 'Arete' },
    { codigo: 'microchip', nombre: 'Microchip' },
  ]
  // Nota: tu tabla tipos_identificacion tiene empresa_id opcional. Creamos global (empresa_id null)
  for (const t of base) {
    const exists = await prisma.tipos_identificacion.findFirst({ where: { codigo: t.codigo } })
    if (!exists) {
      await prisma.tipos_identificacion.create({
        data: {
          empresa_id: null,
          empresa_id_u: null,
          codigo: t.codigo,
          nombre: t.nombre,
        } as any,
      })
    }
  }
  const all = await prisma.tipos_identificacion.findMany()
  if (!all.length) throw new Error('No se pudieron asegurar tipos_identificacion')
  return all
}

async function ensureEstadosRecordatorio() {
  const base = [
    { codigo: 'pendiente', nombre: 'Pendiente', orden: 1 },
    { codigo: 'hecho', nombre: 'Hecho', orden: 2 },
    { codigo: 'cancelado', nombre: 'Cancelado', orden: 3 },
  ]
  for (const e of base) {
    const exists = await prisma.estados_recordatorio.findUnique({ where: { codigo: e.codigo } }).catch(() => null)
    if (!exists) await prisma.estados_recordatorio.create({ data: e as any })
  }
  return prisma.estados_recordatorio.findMany()
}

async function ensureTiposRecordatorio() {
  const base = [
    { codigo: 'vacuna', nombre: 'Vacunación' },
    { codigo: 'retiro_leche', nombre: 'Retiro de leche' },
    { codigo: 'retiro_carne', nombre: 'Retiro de carne' },
    { codigo: 'control', nombre: 'Control / Revisión' },
  ]
  for (const t of base) {
    const exists = await prisma.tipos_recordatorio.findFirst({ where: { codigo: t.codigo } })
    if (!exists) {
      await prisma.tipos_recordatorio.create({
        data: { empresa_id: null, empresa_id_u: null, codigo: t.codigo, nombre: t.nombre } as any,
      })
    }
  }
  return prisma.tipos_recordatorio.findMany()
}

async function ensureTiposRetiro() {
  const base = [
    { codigo: 'LECHE', nombre: 'Retiro de leche' },
    { codigo: 'CARNE', nombre: 'Retiro de carne' },
  ]
  for (const t of base) {
    const exists = await prisma.tipos_retiro.findFirst({ where: { codigo: t.codigo } })
    if (!exists) {
      await prisma.tipos_retiro.create({ data: { empresa_id: null, empresa_id_u: null, codigo: t.codigo, nombre: t.nombre } as any })
    }
  }
  return prisma.tipos_retiro.findMany()
}

async function ensureTurnosOrdenio() {
  const base = [
    { codigo: 'AM', nombre: 'Mañana' },
    { codigo: 'PM', nombre: 'Tarde' },
  ]
  for (const t of base) {
    const exists = await prisma.turnos_ordenio.findFirst({ where: { codigo: t.codigo } })
    if (!exists) {
      await prisma.turnos_ordenio.create({ data: { empresa_id: null, empresa_id_u: null, codigo: t.codigo, nombre: t.nombre } as any })
    }
  }
  return prisma.turnos_ordenio.findMany()
}

async function ensureCatalogosVeterinarios(empresaId: bigint) {
  // enfermedades / medicamentos (empresa opcional)
  const enfCount = await prisma.enfermedades.count({ where: { OR: [{ empresa_id: null }, { empresa_id: empresaId }] } })
  if (enfCount === 0) {
    await prisma.enfermedades.createMany({
      data: [
        { empresa_id: empresaId, empresa_id_u: empresaId, codigo: 'mastitis', nombre: 'Mastitis', tipo: 'bovina' },
        { empresa_id: empresaId, empresa_id_u: empresaId, codigo: 'fiebre', nombre: 'Fiebre', tipo: 'general' },
        { empresa_id: empresaId, empresa_id_u: empresaId, codigo: 'cojera', nombre: 'Cojera', tipo: 'general' },
        { empresa_id: empresaId, empresa_id_u: empresaId, codigo: 'parasitos', nombre: 'Parásitos', tipo: 'general' },
        { empresa_id: empresaId, empresa_id_u: empresaId, codigo: 'anemia', nombre: 'Anemia', tipo: 'general' },
      ] as any,
      skipDuplicates: true,
    })
  }

  const medCount = await prisma.medicamentos.count({ where: { OR: [{ empresa_id: null }, { empresa_id: empresaId }] } })
  if (medCount === 0) {
    await prisma.medicamentos.createMany({
      data: [
        { empresa_id: empresaId, empresa_id_u: empresaId, codigo: 'ATB-01', nombre: 'Antibiótico A', principio_activo: 'Amoxicilina' },
        { empresa_id: empresaId, empresa_id_u: empresaId, codigo: 'AIN-01', nombre: 'Antiinflamatorio', principio_activo: 'Flunixina' },
        { empresa_id: empresaId, empresa_id_u: empresaId, codigo: 'VIT-01', nombre: 'Complejo vitamínico', principio_activo: 'Vitaminas' },
        { empresa_id: empresaId, empresa_id_u: empresaId, codigo: 'ANTP-01', nombre: 'Antiparasitario', principio_activo: 'Ivermectina' },
        { empresa_id: empresaId, empresa_id_u: empresaId, codigo: 'ELECT-01', nombre: 'Electrolitos', principio_activo: 'Sales' },
      ] as any,
      skipDuplicates: true,
    })
  }

  const enfermedades = await prisma.enfermedades.findMany({ where: { OR: [{ empresa_id: null }, { empresa_id: empresaId }] } })
  const medicamentos = await prisma.medicamentos.findMany({ where: { OR: [{ empresa_id: null }, { empresa_id: empresaId }] } })
  return { enfermedades, medicamentos }
}

async function ensureCatalogosAnimales(empresaId: bigint) {
  // categorias_animales / estados_animales (empresa opcional)
  const estadosCount = await prisma.estados_animales.count({ where: { OR: [{ empresa_id: null }, { empresa_id: empresaId }] } })
  if (estadosCount === 0) {
    await prisma.estados_animales.createMany({
      data: [
        { empresa_id: empresaId, empresa_id_u: empresaId, codigo: 'activo', nombre: 'Activo', activo: true },
        { empresa_id: empresaId, empresa_id_u: empresaId, codigo: 'vendido', nombre: 'Vendido', activo: true },
        { empresa_id: empresaId, empresa_id_u: empresaId, codigo: 'muerto', nombre: 'Muerto', activo: true },
      ] as any,
      skipDuplicates: true,
    })
  }

  const categoriasCount = await prisma.categorias_animales.count({ where: { OR: [{ empresa_id: null }, { empresa_id: empresaId }] } })
  if (categoriasCount === 0) {
    await prisma.categorias_animales.createMany({
      data: [
        { empresa_id: empresaId, empresa_id_u: empresaId, codigo: 'TER', nombre: 'Ternero/a', sexo_requerido: null, activo: true, orden: 1 },
        { empresa_id: empresaId, empresa_id_u: empresaId, codigo: 'NOV', nombre: 'Novillo', sexo_requerido: 'M', activo: true, orden: 2 },
        { empresa_id: empresaId, empresa_id_u: empresaId, codigo: 'VAC', nombre: 'Vaca', sexo_requerido: 'F', activo: true, orden: 3 },
        { empresa_id: empresaId, empresa_id_u: empresaId, codigo: 'TOR', nombre: 'Toro', sexo_requerido: 'M', activo: true, orden: 4 },
      ] as any,
      skipDuplicates: true,
    })
  }

  const estados = await prisma.estados_animales.findMany({ where: { OR: [{ empresa_id: null }, { empresa_id: empresaId }] } })
  const categorias = await prisma.categorias_animales.findMany({ where: { OR: [{ empresa_id: null }, { empresa_id: empresaId }] } })
  return { estados, categorias }
}

async function ensureCatalogosReproduccion(empresaId: bigint) {
  // tipos_evento_reproductivo / resultados_palpacion (empresa opcional)
  const tipoCount = await prisma.tipos_evento_reproductivo.count({ where: { OR: [{ empresa_id: null }, { empresa_id: empresaId }] } })
  if (tipoCount === 0) {
    await prisma.tipos_evento_reproductivo.createMany({
      data: [
        { empresa_id: empresaId, empresa_id_u: empresaId, codigo: 'celo', nombre: 'Celo' },
        { empresa_id: empresaId, empresa_id_u: empresaId, codigo: 'servicio', nombre: 'Servicio' },
        { empresa_id: empresaId, empresa_id_u: empresaId, codigo: 'palpacion', nombre: 'Palpación' },
        { empresa_id: empresaId, empresa_id_u: empresaId, codigo: 'parto', nombre: 'Parto' },
      ] as any,
      skipDuplicates: true,
    })
  }

  const resCount = await prisma.resultados_palpacion.count({ where: { OR: [{ empresa_id: null }, { empresa_id: empresaId }] } })
  if (resCount === 0) {
    await prisma.resultados_palpacion.createMany({
      data: [
        { empresa_id: empresaId, empresa_id_u: empresaId, codigo: 'preñada', nombre: 'Preñada' },
        { empresa_id: empresaId, empresa_id_u: empresaId, codigo: 'no_preñada', nombre: 'No preñada' },
        { empresa_id: empresaId, empresa_id_u: empresaId, codigo: 'dudosa', nombre: 'Dudosa' },
      ] as any,
      skipDuplicates: true,
    })
  }

  const tiposEvento = await prisma.tipos_evento_reproductivo.findMany({ where: { OR: [{ empresa_id: null }, { empresa_id: empresaId }] } })
  const resultados = await prisma.resultados_palpacion.findMany({ where: { OR: [{ empresa_id: null }, { empresa_id: empresaId }] } })
  return { tiposEvento, resultados }
}

async function ensureTiposAdjunto(empresaId: bigint) {
  // tipos_adjunto (empresa opcional)
  const count = await prisma.tipos_adjunto.count({ where: { OR: [{ empresa_id: null }, { empresa_id: empresaId }] } })
  if (count === 0) {
    await prisma.tipos_adjunto.createMany({
      data: [
        { empresa_id: empresaId, empresa_id_u: empresaId, codigo: 'pdf', nombre: 'PDF' },
        { empresa_id: empresaId, empresa_id_u: empresaId, codigo: 'img', nombre: 'Imagen' },
        { empresa_id: empresaId, empresa_id_u: empresaId, codigo: 'xml', nombre: 'XML' },
      ] as any,
      skipDuplicates: true,
    })
  }
  return prisma.tipos_adjunto.findMany({ where: { OR: [{ empresa_id: null }, { empresa_id: empresaId }] } })
}

async function ensureCategoriasFinancieras(empresaId: bigint) {
  // categorias_financieras requiere id_tipo_transaccion
  const tipoIngreso = await prisma.tipos_transaccion.findFirst({ where: { codigo: 'ingreso' } })
  const tipoGasto = await prisma.tipos_transaccion.findFirst({ where: { codigo: 'gasto' } })
  if (!tipoIngreso || !tipoGasto) throw new Error('Faltan tipos_transaccion para categorias_financieras')

  const count = await prisma.categorias_financieras.count({ where: { OR: [{ empresa_id: null }, { empresa_id: empresaId }] } })
  if (count === 0) {
    await prisma.categorias_financieras.createMany({
      data: [
        { empresa_id: empresaId, empresa_id_u: empresaId, codigo: 'VENTA_LECHE', nombre: 'Venta de leche', id_tipo_transaccion: tipoIngreso.id_tipo_transaccion, activo: true, orden: 1 },
        { empresa_id: empresaId, empresa_id_u: empresaId, codigo: 'VENTA_GANADO', nombre: 'Venta de ganado', id_tipo_transaccion: tipoIngreso.id_tipo_transaccion, activo: true, orden: 2 },
        { empresa_id: empresaId, empresa_id_u: empresaId, codigo: 'ALIMENTO', nombre: 'Alimento', id_tipo_transaccion: tipoGasto.id_tipo_transaccion, activo: true, orden: 3 },
        { empresa_id: empresaId, empresa_id_u: empresaId, codigo: 'MEDICINA', nombre: 'Medicamentos', id_tipo_transaccion: tipoGasto.id_tipo_transaccion, activo: true, orden: 4 },
        { empresa_id: empresaId, empresa_id_u: empresaId, codigo: 'MANTENIMIENTO', nombre: 'Mantenimiento', id_tipo_transaccion: tipoGasto.id_tipo_transaccion, activo: true, orden: 5 },
      ] as any,
      skipDuplicates: true,
    })
  }

  return prisma.categorias_financieras.findMany({ where: { OR: [{ empresa_id: null }, { empresa_id: empresaId }] } })
}

// -----------------------------
// Main Seed
// -----------------------------
async function seedDemo() {
  faker.seed(1234)
  console.log('🌱 Iniciando seed DEMO (schema actual)...')

  // 0) Asegurar catálogos globales mínimos
  const { monedaCOP, monedaUSD } = await ensureMonedas()
  const estadosPotreros = await ensureEstadosPotreros()
  await ensureEstadosRecordatorio()
  await ensureTiposRecordatorio()
  await ensureTiposRetiro()
  await ensureTurnosOrdenio()
  await ensureTiposTransaccion()
  const motivosMov = await ensureMotivosMovimiento()
  const tiposIdent = await ensureTiposIdentificacion()
  const { ambitoEmpresa, ambitoFinca } = await ensureAmbitosRol()

  // 1) Empresa (re-use by nombre)
  const existingEmpresa = await prisma.empresas.findFirst({ where: { nombre: DEMO.empresaNombre } })
  const empresa = existingEmpresa
    ? await prisma.empresas.update({
        where: { id_empresa: existingEmpresa.id_empresa },
        data: {
          documento_fiscal: DEMO.empresaDocumento,
          estado: 'activa',
          notas: 'Empresa de demostración (seed_demo)',
        },
      })
    : await prisma.empresas.create({
        data: {
          nombre: DEMO.empresaNombre,
          documento_fiscal: DEMO.empresaDocumento,
          estado: 'activa',
          notas: 'Empresa de demostración (seed_demo)',
        },
      })

  const empresaId = empresa.id_empresa
  console.log(`🏢 Empresa: ${empresa.nombre} (id=${empresaId})`)

  // 2) Asegurar catálogos por empresa
  const { estados: estadosAnimales, categorias: categoriasAnimales } = await ensureCatalogosAnimales(empresaId)
  const { enfermedades, medicamentos } = await ensureCatalogosVeterinarios(empresaId)
  const { tiposEvento, resultados } = await ensureCatalogosReproduccion(empresaId)
  const tiposAdjunto = await ensureTiposAdjunto(empresaId)
  const categoriasFin = await ensureCategoriasFinancieras(empresaId)
  const turnosOrdenio = await prisma.turnos_ordenio.findMany()

  // 3) Usuario admin
  const admin = await prisma.usuarios.upsert({
    where: { email: DEMO.adminEmail },
    update: { nombre: DEMO.adminNombre, activo: true },
    create: {
      email: DEMO.adminEmail,
      nombre: DEMO.adminNombre,
      activo: true,
    },
  })
  console.log(`👤 Usuario admin: ${admin.email} (id=${admin.id_usuario})`)

  // 4) Roles admin por empresa / finca
  async function ensureRol(empresa_id: bigint, codigo: string, nombre: string, id_ambito_rol: bigint, descripcion: string) {
    const existing = await prisma.roles.findFirst({ where: { empresa_id, codigo } })
    if (existing) {
      return prisma.roles.update({
        where: { id_rol: existing.id_rol },
        data: { nombre, activo: true, id_ambito_rol, descripcion },
      })
    }
    return prisma.roles.create({
      data: { empresa_id, codigo, nombre, activo: true, id_ambito_rol, descripcion } as any,
    })
  }

  const rolAdminEmpresa = await ensureRol(empresaId, 'ADMIN_EMPRESA', 'Administrador Empresa', ambitoEmpresa.id_ambito_rol, 'Acceso total a nivel empresa')
  const rolAdminFinca = await ensureRol(empresaId, 'ADMIN_FINCA', 'Administrador Finca', ambitoFinca.id_ambito_rol, 'Acceso total a nivel finca')

  // 5) usuario_empresas (link)
  {
    const existing = await prisma.usuario_empresas.findUnique({
      where: { id_usuario_id_empresa: { id_usuario: admin.id_usuario, id_empresa: empresaId } as any },
    }).catch(() => null)

    if (existing) {
      await prisma.usuario_empresas.update({
        where: { id_usuario_id_empresa: { id_usuario: admin.id_usuario, id_empresa: empresaId } as any },
        data: { id_rol: rolAdminEmpresa.id_rol, estado: 'activo', es_activa: true },
      })
    } else {
      await prisma.usuario_empresas.create({
        data: { id_usuario: admin.id_usuario, id_empresa: empresaId, id_rol: rolAdminEmpresa.id_rol, estado: 'activo', es_activa: true } as any,
      })
    }
  }

  // 6) Finca
  const fincaExisting = await prisma.fincas.findFirst({ where: { empresa_id: empresaId, nombre: DEMO.fincaNombre } })
  const finca = fincaExisting
    ? await prisma.fincas.update({
        where: { id_finca_empresa_id: { id_finca: fincaExisting.id_finca, empresa_id: empresaId } as any },
        data: {
          moneda_base_id: monedaCOP.id_moneda,
          area_hectareas: decimal(250),
          direccion: 'Zona rural - Demo',
          notas: 'Finca demo (seed_demo)',
        },
      })
    : await prisma.fincas.create({
        data: {
          empresa_id: empresaId,
          nombre: DEMO.fincaNombre,
          moneda_base_id: monedaCOP.id_moneda,
          area_hectareas: decimal(250),
          direccion: 'Zona rural - Demo',
          notas: 'Finca demo (seed_demo)',
        } as any,
      })

  console.log(`🌿 Finca: ${finca.nombre} (id_finca=${finca.id_finca}, empresa_id=${empresaId})`)

  // 7) usuario_fincas (link)
  {
    const existing = await prisma.usuario_fincas.findUnique({
      where: { id_usuario_id_finca_empresa_id: { id_usuario: admin.id_usuario, id_finca: finca.id_finca, empresa_id: empresaId } as any },
    }).catch(() => null)

    if (existing) {
      await prisma.usuario_fincas.update({
        where: { id_usuario_id_finca_empresa_id: { id_usuario: admin.id_usuario, id_finca: finca.id_finca, empresa_id: empresaId } as any },
        data: { id_rol: rolAdminFinca.id_rol },
      })
    } else {
      await prisma.usuario_fincas.create({
        data: { id_usuario: admin.id_usuario, id_finca: finca.id_finca, empresa_id: empresaId, id_rol: rolAdminFinca.id_rol, desde: dateOnly(daysAgo(365)) } as any,
      })
    }
  }

  // 8) Centro recepción
  const centroExisting = await prisma.centros_recepcion.findFirst({ where: { empresa_id: empresaId, nombre: DEMO.centroRecepcionNombre } })
  const centro = centroExisting
    ? centroExisting
    : await prisma.centros_recepcion.create({
        data: {
          empresa_id: empresaId,
          nombre: DEMO.centroRecepcionNombre,
          contacto: 'Recepción Demo',
          telefono: '+57 300 000 0000',
          notas: 'Centro demo (seed_demo)',
        } as any,
      })

  // 9) Lotes (más)
  const lotesNames = Array.from({ length: DEMO.lotesCount }, (_, i) => `Lote ${String(i + 1).padStart(2, '0')}`)
  const lotesExisting = await prisma.lotes.findMany({ where: { empresa_id: empresaId, id_finca: finca.id_finca } })
  const lotesByName = new Map(lotesExisting.map((l) => [l.nombre, l]))

  const lotes: { id_lote: bigint; empresa_id: bigint; id_finca: bigint; nombre: string }[] = []
  for (const nombre of lotesNames) {
    const existing = lotesByName.get(nombre)
    if (existing) {
      lotes.push({ id_lote: existing.id_lote, empresa_id: existing.empresa_id, id_finca: existing.id_finca, nombre: existing.nombre })
      continue
    }
    const l = await prisma.lotes.create({
      data: { empresa_id: empresaId, id_finca: finca.id_finca, nombre, descripcion: `Descripción ${nombre}`, activo: true } as any,
    })
    lotes.push({ id_lote: l.id_lote, empresa_id: l.empresa_id, id_finca: l.id_finca, nombre: l.nombre })
  }
  console.log(`🧩 Lotes asegurados: ${lotes.length}`)

  // 10) Potreros (más) + geometry
  const baseLon = -74.1
  const baseLat = 4.65

  const potrerosExisting = await prisma.potreros.findMany({ where: { empresa_id: empresaId, id_finca: finca.id_finca } })
  const potrerosByName = new Map(potrerosExisting.map((p) => [p.nombre, p]))

  const estadoDisponible = estadosPotreros.find((e) => e.codigo === 'disponible') ?? estadosPotreros[0]
  const estadoOcupado = estadosPotreros.find((e) => e.codigo === 'ocupado') ?? estadosPotreros[0]

  const potreros: { id_potrero: bigint; empresa_id: bigint; id_finca: bigint; nombre: string }[] = []
  for (let i = 1; i <= DEMO.potrerosCount; i++) {
    const nombre = `Potrero ${String(i).padStart(2, '0')}`
    const existing = potrerosByName.get(nombre)
    if (existing) {
      potreros.push({ id_potrero: existing.id_potrero, empresa_id: existing.empresa_id, id_finca: existing.id_finca, nombre: existing.nombre })
      continue
    }

    const lon = baseLon + faker.number.float({ min: -0.05, max: 0.05 })
    const lat = baseLat + faker.number.float({ min: -0.05, max: 0.05 })
    const geom = squarePolygon(lon, lat, faker.number.int({ min: 70, max: 180 }))
    const areaHa = faker.number.float({ min: 1.2, max: 7.5 })
    const areaM2 = areaHa * 10000

    const p = await prisma.potreros.create({
      data: {
        empresa_id: empresaId,
        id_finca: finca.id_finca,
        nombre,
        area_hectareas: decimal(to2(areaHa)),
        area_m2: decimal(to2(areaM2)),
        geometry: geom as any,
        id_estado_potrero: estadoDisponible.id_estado_potrero,
        capacidad_animales: decimal(to2(areaHa * faker.number.float({ min: 2.0, max: 3.4 }))),
        notas: 'Potrero demo (seed_demo)',
      } as any,
    })
    potreros.push({ id_potrero: p.id_potrero, empresa_id: p.empresa_id, id_finca: p.id_finca, nombre: p.nombre })
  }
  console.log(`🗺️ Potreros asegurados: ${potreros.length}`)

  // 11) Ocupación: historial + activas (potrero<->lote)
  //    Regla: 1 ocupación activa por potrero (asignamos lotes rotando), y algunas ocupaciones cerradas históricas.
  const existingOcup = await prisma.ocupacion_potreros.findMany({ where: { empresa_id: empresaId, id_finca: finca.id_finca } })
  const ocupKey = (o: { id_potrero: bigint; id_lote: bigint; is_active: boolean }) => `${o.id_potrero}:${o.id_lote}:${o.is_active ? 1 : 0}`
  const ocupKeys = new Set(existingOcup.map((o) => ocupKey({ id_potrero: o.id_potrero, id_lote: o.id_lote, is_active: (o as any).is_active })))

  // Crear historial (cerradas)
  for (let i = 0; i < Math.min(20, potreros.length); i++) {
    const potrero = potreros[i]
    const lote = lotes[i % lotes.length]
    const key = ocupKey({ id_potrero: potrero.id_potrero, id_lote: lote.id_lote, is_active: false })
    if (ocupKeys.has(key)) continue

    const inicio = dateOnly(daysAgo(randInt(180, 420)))
    const fin = dateOnly(daysAgo(randInt(60, 170)))
    await prisma.ocupacion_potreros.create({
      data: {
        empresa_id: empresaId,
        id_finca: finca.id_finca,
        id_lote: lote.id_lote,
        id_potrero: potrero.id_potrero,
        fecha_inicio: inicio,
        fecha_fin: fin,
        is_active: false,
        notas: 'Ocupación histórica demo',
      } as any,
    }).catch(() => {})
  }

  // Crear activas (1 por potrero)
  const ocupacionActivaPorPotrero = new Map<bigint, { id_potrero: bigint; id_lote: bigint }>()
  for (let i = 0; i < potreros.length; i++) {
    const potrero = potreros[i]
    const lote = lotes[(i * 3) % lotes.length] // dispersión
    const key = ocupKey({ id_potrero: potrero.id_potrero, id_lote: lote.id_lote, is_active: true })
    if (!ocupKeys.has(key)) {
      await prisma.ocupacion_potreros.create({
        data: {
          empresa_id: empresaId,
          id_finca: finca.id_finca,
          id_lote: lote.id_lote,
          id_potrero: potrero.id_potrero,
          fecha_inicio: dateOnly(daysAgo(randInt(10, 120))),
          fecha_fin: null,
          is_active: true,
          notas: 'Ocupación activa demo',
        } as any,
      }).catch(() => {})
    }
    ocupacionActivaPorPotrero.set(potrero.id_potrero, { id_potrero: potrero.id_potrero, id_lote: lote.id_lote })

    // Marcar potrero como ocupado
    await prisma.potreros
      .update({
        where: { id_potrero_empresa_id: { id_potrero: potrero.id_potrero, empresa_id: empresaId } as any },
        data: { id_estado_potrero: estadoOcupado.id_estado_potrero },
      })
      .catch(() => {})
  }
  console.log(`🧱 Ocupación (historial + activas) asegurada.`)

  // Helper: elegir destino coherente (potrero activo -> lote asociado)
  function pickDestinoPotreroYLote() {
    const potrero = randPick(potreros)
    const active = ocupacionActivaPorPotrero.get(potrero.id_potrero)
    const loteId = active?.id_lote ?? randPick(lotes).id_lote
    return { potreroId: potrero.id_potrero, loteId }
  }

  // 12) Animales (más) + ALTA movement inicial + lote_actual_id
  const existentes = await prisma.animales.count({ where: { empresa_id: empresaId, id_finca: finca.id_finca } })
  const toCreate = Math.max(0, DEMO.animalesCount - existentes)
  console.log(`🐄 Animales existentes: ${existentes}. A crear: ${toCreate}`)

  const createdAnimales: { id_animal: bigint; empresa_id: bigint; sexo: string }[] = []
  if (toCreate > 0) {
    for (let i = 0; i < toCreate; i++) {
      const sexo = faker.helpers.weightedArrayElement([
        { weight: 68, value: 'F' },
        { weight: 32, value: 'M' },
      ])

      const ageDays = randInt(60, 10 * 365)
      const birth = dateOnly(daysAgo(ageDays))
      const destino = pickDestinoPotreroYLote()

      const animal = await prisma.animales.create({
        data: {
          empresa_id: empresaId,
          id_finca: finca.id_finca,
          lote_actual_id: destino.loteId, // se mantiene como "lote actual"
          nombre: sexo === 'F' ? faker.person.firstName('female') : faker.person.firstName('male'),
          sexo,
          fecha_nacimiento: birth,
          fecha_nacimiento_estimada: faker.datatype.boolean({ probability: 0.25 }),
          foto_url: null,
          notas: 'Animal demo',
        } as any,
        select: { id_animal: true, empresa_id: true, sexo: true },
      })

      createdAnimales.push(animal)

      // Movimiento inicial (ALTA) = define potrero/lote "source of truth"
      const motivoAlta = motivosMov.find((m) => m.codigo === 'ALTA') ?? motivosMov[0]
      await prisma.movimientos_animales.create({
        data: {
          empresa_id: empresaId,
          id_finca: finca.id_finca,
          fecha_hora: new Date(daysAgo(randInt(1, 30))), // reciente
          id_animal: animal.id_animal,
          lote_origen_id: null,
          lote_destino_id: destino.loteId,
          potrero_origen_id: null,
          potrero_destino_id: destino.potreroId,
          id_motivo_movimiento: motivoAlta.id_motivo_movimiento,
          observaciones: 'Alta demo (seed)',
          created_by: admin.id_usuario,
        } as any,
      }).catch(() => {})
    }
  }

  // 13) Identificaciones para nuevos animales
  const tipoArete = tiposIdent.find((t) => t.codigo === 'arete') ?? tiposIdent[0]
  const tipoChip = tiposIdent.find((t) => t.codigo === 'microchip') ?? tiposIdent[0]

  for (const a of createdAnimales) {
    const areteValue = `AR-${faker.number.int({ min: 100000, max: 999999 })}`
    await prisma.animal_identificaciones.create({
      data: {
        empresa_id: empresaId,
        id_animal: a.id_animal,
        id_tipo_identificacion: tipoArete.id_tipo_identificacion,
        valor: areteValue,
        fecha_asignacion: dateOnly(daysAgo(randInt(1, 1200))),
        activo: true,
        es_principal: true,
        observaciones: null,
      } as any,
    }).catch(() => {})

    if (faker.datatype.boolean({ probability: 0.45 })) {
      const chipValue = `CHIP-${faker.number.int({ min: 100000000, max: 999999999 })}`
      await prisma.animal_identificaciones.create({
        data: {
          empresa_id: empresaId,
          id_animal: a.id_animal,
          id_tipo_identificacion: tipoChip.id_tipo_identificacion,
          valor: chipValue,
          fecha_asignacion: dateOnly(daysAgo(randInt(1, 1200))),
          activo: true,
          es_principal: false,
          observaciones: null,
        } as any,
      }).catch(() => {})
    }
  }

  // 14) Historial de categoría/estado (1 actual por animal nuevo)
  const estadoActivo = estadosAnimales.find((e) => e.codigo === 'activo') ?? estadosAnimales[0]
  const estadoVendido = estadosAnimales.find((e) => e.codigo === 'vendido') ?? estadosAnimales[0]

  const catsF = categoriasAnimales.filter((c) => c.sexo_requerido === 'F' || c.sexo_requerido == null)
  const catsM = categoriasAnimales.filter((c) => c.sexo_requerido === 'M' || c.sexo_requerido == null)

  for (const a of createdAnimales) {
    const cat = a.sexo === 'F' ? randPick(catsF) : randPick(catsM)
    const start = dateOnly(daysAgo(randInt(10, 900)))

    await prisma.animal_categorias_historial.create({
      data: {
        empresa_id: empresaId,
        id_animal: a.id_animal,
        id_categoria_animal: cat.id_categoria_animal,
        fecha_inicio: start,
        fecha_fin: null,
        observaciones: null,
      } as any,
    }).catch(() => {})

    const isSold = faker.datatype.boolean({ probability: 0.05 })
    await prisma.animal_estados_historial.create({
      data: {
        empresa_id: empresaId,
        id_animal: a.id_animal,
        id_estado_animal: isSold ? estadoVendido.id_estado_animal : estadoActivo.id_estado_animal,
        fecha_inicio: start,
        fecha_fin: null,
        motivo: isSold ? 'Venta demo' : null,
      } as any,
    }).catch(() => {})
  }

  // 15) Movimientos extra (coherentes) + mantener lote_actual_id al final
  const animalesAll = await prisma.animales.findMany({
    where: { empresa_id: empresaId, id_finca: finca.id_finca },
    select: { id_animal: true, empresa_id: true, lote_actual_id: true },
    take: 2000,
  })

  const motivoTraslado = motivosMov.find((m) => m.codigo === 'TRASLADO') ?? motivosMov[0]

  // Creamos movimientos por animal:
  // - cada movimiento elige destino (potrero activo + lote asociado)
  // - origen se toma del lote_actual_id actual del animal (si existe)
  // - luego actualizamos lote_actual_id al destino (misma “verdad” del sistema)
  const animalesSample = faker.helpers.arrayElements(animalesAll, Math.min(animalesAll.length, DEMO.animalesCount))
  console.log(`🚚 Generando movimientos extra para ${animalesSample.length} animales...`)

  for (const a of animalesSample) {
    const movesCount = randInt(DEMO.movimientosExtraPorAnimalMin, DEMO.movimientosExtraPorAnimalMax)
    let currentLote = a.lote_actual_id ?? randPick(lotes).id_lote

    for (let i = 0; i < movesCount; i++) {
      const destino = pickDestinoPotreroYLote()
      const fecha = new Date(daysAgo(randInt(1, 240)))
      fecha.setHours(randInt(6, 18), randInt(0, 59), 0, 0)

      await prisma.$transaction(async (tx) => {
        await tx.movimientos_animales.create({
          data: {
            empresa_id: empresaId,
            id_finca: finca.id_finca,
            fecha_hora: fecha,
            id_animal: a.id_animal,
            lote_origen_id: currentLote,
            lote_destino_id: destino.loteId,
            potrero_origen_id: null,
            potrero_destino_id: destino.potreroId,
            id_motivo_movimiento: motivoTraslado.id_motivo_movimiento,
            observaciones: 'Traslado demo',
            created_by: admin.id_usuario,
          } as any,
        })

        await tx.animales.update({
          where: { id_animal_empresa_id: { id_animal: a.id_animal, empresa_id: empresaId } as any },
          data: { lote_actual_id: destino.loteId },
        })
      }).catch(() => {})

      currentLote = destino.loteId
    }
  }

  // 16) Eventos sanitarios + tratamientos + retiros + recordatorios (más)
  const animalesForSalud = await prisma.animales.findMany({
    where: { empresa_id: empresaId, id_finca: finca.id_finca },
    select: { id_animal: true, empresa_id: true },
    take: 400,
  })

  const tiposRecordatorio = await prisma.tipos_recordatorio.findMany()
  const estadosRecord = await prisma.estados_recordatorio.findMany()
  const estadoPendiente = estadosRecord.find((e) => e.codigo === 'pendiente') ?? estadosRecord[0]
  const tipoRecVacuna = tiposRecordatorio.find((t) => t.codigo === 'vacuna') ?? tiposRecordatorio[0]
  const tipoRecControl = tiposRecordatorio.find((t) => t.codigo === 'control') ?? tiposRecordatorio[0]

  const tipoRetLeche = await prisma.tipos_retiro.findFirst({ where: { codigo: 'LECHE' } })
  const tipoRecRetLeche = tiposRecordatorio.find((t) => t.codigo === 'retiro_leche') ?? tiposRecordatorio[0]

  for (let i = 0; i < 55; i++) {
    const a = randPick(animalesForSalud)
    const enf = randPick(enfermedades)
    const fechaEv = dateOnly(daysAgo(randInt(1, 240)))

    const evento = await prisma.eventos_sanitarios
      .create({
        data: {
          empresa_id: empresaId,
          id_animal: a.id_animal,
          fecha: fechaEv,
          id_enfermedad: (enf as any)?.id_enfermedad ?? null,
          descripcion: 'Evento sanitario demo',
          created_by: admin.id_usuario,
        } as any,
        select: { id_evento_sanitario: true },
      })
      .catch(() => null)

    if (!evento) continue

    // Tratamiento (75%)
    if (faker.datatype.boolean({ probability: 0.75 })) {
      const med = randPick(medicamentos)
      const tr = await prisma.tratamientos
        .create({
          data: {
            empresa_id: empresaId,
            id_evento_sanitario: evento.id_evento_sanitario,
            id_animal: a.id_animal,
            fecha_inicio: fechaEv,
            id_medicamento: (med as any).id_medicamento,
            dosis: `${randInt(5, 20)} ml`,
            via_administracion: randPick(['IM', 'SC', 'Oral']),
            notas: 'Tratamiento demo',
            created_by: admin.id_usuario,
          } as any,
          select: { id_tratamiento: true, fecha_inicio: true },
        })
        .catch(() => null)

      // Retiro leche + recordatorio (50%)
      if (tr && tipoRetLeche && faker.datatype.boolean({ probability: 0.5 })) {
        const dias = randInt(2, 12)
        const fin = new Date(tr.fecha_inicio)
        fin.setDate(fin.getDate() + dias)

        const ret = await prisma.retiros
          .create({
            data: {
              id_tratamiento: tr.id_tratamiento,
              id_tipo_retiro: tipoRetLeche.id_tipo_retiro,
              dias_retiro: dias,
              fecha_inicio: tr.fecha_inicio,
              fecha_fin: dateOnly(fin),
              activo: true,
            } as any,
            select: { id_retiro: true, fecha_fin: true },
          })
          .catch(() => null)

        if (ret) {
          await prisma.recordatorios
            .create({
              data: {
                empresa_id: empresaId,
                id_tipo_recordatorio: tipoRecRetLeche.id_tipo_recordatorio,
                id_animal: a.id_animal,
                fecha_programada: ret.fecha_fin,
                descripcion: 'Fin retiro de leche (demo)',
                estado_codigo: estadoPendiente.codigo,
                id_tratamiento: tr.id_tratamiento,
                id_retiro: ret.id_retiro,
              } as any,
            })
            .catch(() => {})
        }
      }
    }

    // Recordatorio control (35%)
    if (faker.datatype.boolean({ probability: 0.35 })) {
      const future = new Date()
      future.setDate(future.getDate() + randInt(3, 45))
      await prisma.recordatorios
        .create({
          data: {
            empresa_id: empresaId,
            id_tipo_recordatorio: tipoRecControl.id_tipo_recordatorio,
            id_animal: a.id_animal,
            fecha_programada: dateOnly(future),
            descripcion: 'Control programado (demo)',
            estado_codigo: estadoPendiente.codigo,
            id_tratamiento: null,
            id_retiro: null,
          } as any,
        })
        .catch(() => {})
    }

    // Recordatorio vacuna (30%)
    if (faker.datatype.boolean({ probability: 0.3 })) {
      const future = new Date()
      future.setDate(future.getDate() + randInt(7, 60))
      await prisma.recordatorios
        .create({
          data: {
            empresa_id: empresaId,
            id_tipo_recordatorio: tipoRecVacuna.id_tipo_recordatorio,
            id_animal: a.id_animal,
            fecha_programada: dateOnly(future),
            descripcion: 'Vacunación programada (demo)',
            estado_codigo: estadoPendiente.codigo,
            id_tratamiento: null,
            id_retiro: null,
          } as any,
        })
        .catch(() => {})
    }
  }

  // 17) Eventos reproductivos (más)
  const hembras = await prisma.animales.findMany({
    where: { empresa_id: empresaId, id_finca: finca.id_finca, sexo: 'F' },
    select: { id_animal: true, empresa_id: true },
    take: 400,
  })
  const machos = await prisma.animales.findMany({
    where: { empresa_id: empresaId, id_finca: finca.id_finca, sexo: 'M' },
    select: { id_animal: true, empresa_id: true },
    take: 150,
  })

  for (let i = 0; i < 120; i++) {
    const hembra = randPick(hembras)
    const tipo = randPick(tiposEvento)
    const fecha = dateOnly(daysAgo(randInt(1, 420)))
    const reproductor = machos.length && faker.datatype.boolean({ probability: 0.65 }) ? randPick(machos) : null

    const isPalp = (tipo as any).codigo === 'palpacion'
    const resPalp = isPalp ? randPick(resultados) : null

    const fechaEstParto =
      (tipo as any).codigo === 'servicio' || (tipo as any).codigo === 'celo'
        ? (() => {
            const d = new Date(fecha)
            d.setDate(d.getDate() + 283)
            return dateOnly(d)
          })()
        : null

    await prisma.eventos_reproductivos
      .create({
        data: {
          empresa_id: empresaId,
          id_animal: hembra.id_animal,
          id_tipo_evento_reproductivo: (tipo as any).id_tipo_evento_reproductivo,
          fecha,
          detalles: 'Evento reproductivo demo',
          id_resultado_palpacion: resPalp ? (resPalp as any).id_resultado_palpacion : null,
          reproductor_id: reproductor ? reproductor.id_animal : null,
          reproductor_identificacion: reproductor ? `TORO-${reproductor.id_animal}` : null,
          proveedor_semen: (tipo as any).codigo === 'servicio' && faker.datatype.boolean({ probability: 0.35 }) ? 'Proveedor Demo' : null,
          codigo_pajuela: (tipo as any).codigo === 'servicio' && faker.datatype.boolean({ probability: 0.35 }) ? `PJ-${randInt(1000, 9999)}` : null,
          fecha_estimada_parto: fechaEstParto,
          control_21_dias: (() => {
            const d = new Date(fecha)
            d.setDate(d.getDate() + 21)
            return dateOnly(d)
          })(),
          created_by: admin.id_usuario,
        } as any,
      })
      .catch(() => {})
  }

  // 18) Producción leche + pesajes por animal (más días)
  const cowsMilk = hembras.slice(0, Math.min(40, hembras.length))
  const today = dateOnly(new Date())
  const startMilk = daysAgo(DEMO.diasProduccion)

  for (let d = new Date(startMilk); d <= today; d.setDate(d.getDate() + 1)) {
    for (const turno of turnosOrdenio) {
      const litros = faker.number.float({ min: 120, max: 320 })
      await prisma.produccion_leche
        .create({
          data: {
            empresa_id: empresaId,
            id_finca: finca.id_finca,
            fecha: dateOnly(d),
            id_turno: (turno as any).id_turno,
            litros: decimal(to2(litros)),
            notas: 'Producción demo',
            created_by: admin.id_usuario,
          } as any,
        })
        .catch(() => {})
    }

    if (faker.datatype.boolean({ probability: 0.6 })) {
      const chosen = faker.helpers.arrayElements(cowsMilk, randInt(10, Math.min(25, cowsMilk.length)))
      const turno = randPick(turnosOrdenio)
      for (const cow of chosen) {
        const litros = faker.number.float({ min: 3.5, max: 22 })
        await prisma.pesajes_leche_animales
          .create({
            data: {
              empresa_id: empresaId,
              id_animal: cow.id_animal,
              fecha: dateOnly(d),
              id_turno: (turno as any).id_turno,
              litros: decimal(to2(litros)),
              notas: 'Pesaje demo',
              created_by: admin.id_usuario,
            } as any,
          })
          .catch(() => {})
      }
    }
  }

  // 19) Entregas + liquidaciones (más)
  for (let i = 0; i < 18; i++) {
    const fecha = dateOnly(daysAgo(randInt(1, DEMO.diasProduccion)))
    const litros = faker.number.float({ min: 900, max: 4200 })
    await prisma.entregas_leche
      .create({
        data: {
          empresa_id: empresaId,
          id_finca: finca.id_finca,
          id_centro: (centro as any).id_centro,
          fecha,
          litros_entregados: decimal(to2(litros)),
          referencia_guia: `GUIA-${randInt(10000, 99999)}`,
          notas: 'Entrega demo',
          created_by: admin.id_usuario,
        } as any,
      })
      .catch(() => {})
  }

  // 3 liquidaciones trimestrales aproximadas
  for (let i = 0; i < 3; i++) {
    const inicio = dateOnly(daysAgo(120 - i * 40))
    const fin = dateOnly(daysAgo(80 - i * 40))
    const litros = faker.number.float({ min: 9000, max: 24000 })
    const precio = faker.number.float({ min: 1600, max: 2600 })
    const monto = litros * precio

    await prisma.liquidaciones_leche
      .create({
        data: {
          empresa_id: empresaId,
          id_finca: finca.id_finca,
          id_centro: (centro as any).id_centro,
          fecha_inicio: inicio,
          fecha_fin: fin,
          litros_pagados: decimal(to2(litros)),
          precio_por_litro: decimal(to2(precio)),
          monto_pagado: decimal(to2(monto)),
          moneda_id: monedaCOP.id_moneda,
          tasa_cambio: null,
          notas: 'Liquidación demo',
          created_by: admin.id_usuario,
        } as any,
      })
      .catch(() => {})
  }

  // 20) Finanzas: transacciones + adjuntos (más)
  if (!categoriasFin.length) {
    console.warn('⚠️ categorias_financieras está vacío. Se omiten transacciones demo.')
  } else {
    const txs: { id_transaccion: bigint }[] = []
    for (let i = 0; i < DEMO.transaccionesCount; i++) {
      const cat = randPick(categoriasFin)
      const fecha = dateOnly(daysAgo(randInt(1, 180)))
      const monto = faker.number.float({ min: 25, max: 9000 })

      const t = await prisma.transacciones_financieras
        .create({
          data: {
            empresa_id: empresaId,
            fecha,
            id_tipo_transaccion: (cat as any).id_tipo_transaccion,
            id_categoria_financiera: (cat as any).id_categoria_financiera,
            monto: decimal(to2(monto)),
            descripcion: faker.lorem.sentence(),
            id_tercero: null,
            created_by: admin.id_usuario,
          } as any,
          select: { id_transaccion: true },
        })
        .catch(() => null)

      if (t) txs.push(t)
    }

    const tipoAdj = tiposAdjunto.find((t) => (t as any).codigo === 'pdf') ?? tiposAdjunto[0]
    for (const t of faker.helpers.arrayElements(txs, Math.min(25, txs.length))) {
      await prisma.adjuntos_transaccion
        .create({
          data: {
            id_transaccion: t.id_transaccion,
            id_tipo_adjunto: (tipoAdj as any).id_tipo_adjunto,
            url_archivo: `https://example.com/demo/adjuntos/${t.id_transaccion}.pdf`,
            notas: 'Adjunto demo',
          } as any,
        })
        .catch(() => {})
    }
  }

  console.log('✅ Seed DEMO completado (schema actual).')
}

// Run
seedDemo()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error seed DEMO:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
