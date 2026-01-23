// prisma/seed_demo.ts
// Demo seed for your multi-tenant Ganadex-style schema (empresa -> finca -> lotes/potreros -> animales -> eventos)
//
// Requirements:
//   npm i -D @faker-js/faker
//
// Usage (example):
//   SEED_MODE=demo tsx prisma/seed_demo.ts
// Or from seed.ts you can import and run it.
//
// Notes:
// - Deterministic: faker.seed(1234)
// - Idempotent-ish: it tries to re-use existing empresa/admin by email; creates missing parts.
// - Uses Prisma Client from your generated output and your MariaDB adapter approach.
// - Keeps "empresa_id_u" strategy: for company-scoped catalogs, it sets empresa_id_u = empresa_id.
//
// IMPORTANT:
//   Ensure your schema already migrated (tables exist).
//   Some fields in your schema might be stricter in DB than Prisma shows; adjust as needed.

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
// Helpers
// -----------------------------
const DEMO = {
  empresaNombre: 'GANADEX Demo Ranch',
  empresaDocumento: 'J-123456-789',
  adminEmail: 'admin@ganadex.demo',
  adminNombre: 'Admin Demo',
  fincaNombre: 'Finca La Esperanza',
  centroRecepcionNombre: 'Centro Lechero Central',
}

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
function chunk<T>(arr: T[], size: number) {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}
function to2(n: number) {
  return Math.round(n * 100) / 100
}
function decimal(n: number) {
  // Prisma Decimal in MySQL: passing number is ok in most cases; if strict, use Prisma.Decimal
  return n as any
}

// Simple square polygon generator around a centroid (lon/lat), for demo geometry
function squarePolygon(lon: number, lat: number, meters: number) {
  // VERY rough conversion: 1 deg lat ~ 111,000m; 1 deg lon ~ 111,000m*cos(lat)
  const dLat = meters / 111000
  const dLon = meters / (111000 * Math.cos((lat * Math.PI) / 180))
  const p = [
    [lon - dLon, lat - dLat],
    [lon + dLon, lat - dLat],
    [lon + dLon, lat + dLat],
    [lon - dLon, lat + dLat],
    [lon - dLon, lat - dLat],
  ]
  return {
    type: 'Polygon',
    coordinates: [p],
  }
}

// -----------------------------
// Main
// -----------------------------
async function seedDemo() {
  faker.seed(1234)
  console.log('🌱 Iniciando seed DEMO...')

  // 0) Preload catalogs we will need
  const [monedaCOP, monedaUSD] = await Promise.all([
    prisma.monedas.findUnique({ where: { iso_alpha3: 'COP' } }),
    prisma.monedas.findUnique({ where: { iso_alpha3: 'USD' } }),
  ])
  if (!monedaCOP) throw new Error('Moneda COP no existe. Corre seed base primero.')
  if (!monedaUSD) throw new Error('Moneda USD no existe. Corre seed base primero.')

  const tipoTxIngreso = await prisma.tipos_transaccion.findFirst({ where: { codigo: 'ingreso' } })
  const tipoTxGasto = await prisma.tipos_transaccion.findFirst({ where: { codigo: 'gasto' } })
  if (!tipoTxIngreso || !tipoTxGasto) throw new Error('tipos_transaccion base faltan. Corre seed base primero.')

  const estadosAnimales = await prisma.estados_animales.findMany({ where: { activo: true } })
  const categoriasAnimales = await prisma.categorias_animales.findMany({ where: { activo: true } })
  const tiposIdent = await prisma.tipos_identificacion.findMany()
  const motivosMov = await prisma.motivos_movimiento.findMany()
  const tiposEventoRep = await prisma.tipos_evento_reproductivo.findMany()
  const resultadosPalp = await prisma.resultados_palpacion.findMany()
  const estadosPotreros = await prisma.estados_potreros.findMany({ where: { activo: true } })
  const turnosOrdenio = await prisma.turnos_ordenio.findMany()
  const tiposAdjunto = await prisma.tipos_adjunto.findMany()
  const enfermedades = await prisma.enfermedades.findMany()
  const medicamentos = await prisma.medicamentos.findMany()

  if (!estadosAnimales.length) throw new Error('estados_animales vacío. Corre seed base.')
  if (!categoriasAnimales.length) throw new Error('categorias_animales vacío. Corre seed base.')
  if (!tiposIdent.length) throw new Error('tipos_identificacion vacío. Corre seed base.')
  if (!motivosMov.length) throw new Error('motivos_movimiento vacío. Corre seed base.')
  if (!tiposEventoRep.length) throw new Error('tipos_evento_reproductivo vacío. Corre seed base.')
  if (!resultadosPalp.length) throw new Error('resultados_palpacion vacío. Corre seed base.')
  if (!estadosPotreros.length) throw new Error('estados_potreros vacío. Corre seed base.')
  if (!turnosOrdenio.length) throw new Error('turnos_ordenio vacío. Corre seed base.')
  if (!tiposAdjunto.length) throw new Error('tipos_adjunto vacío. Corre seed base.')

  // 1) Empresa DEMO (re-use if exists by name)
  const empresa = await prisma.empresas.upsert({
    where: { id_empresa: (await prisma.empresas.findFirst({ where: { nombre: DEMO.empresaNombre } }))?.id_empresa ?? 0n },
    update: {
      documento_fiscal: DEMO.empresaDocumento,
      estado: 'activa',
      notas: 'Empresa de demostración (seed_demo)',
    },
    create: {
      nombre: DEMO.empresaNombre,
      documento_fiscal: DEMO.empresaDocumento,
      estado: 'activa',
      notas: 'Empresa de demostración (seed_demo)',
    },
  }).catch(async () => {
    // If the "upsert by id" trick fails due to 0n not existing, fallback:
    const existing = await prisma.empresas.findFirst({ where: { nombre: DEMO.empresaNombre } })
    if (existing) return existing
    return prisma.empresas.create({
      data: {
        nombre: DEMO.empresaNombre,
        documento_fiscal: DEMO.empresaDocumento,
        estado: 'activa',
        notas: 'Empresa de demostración (seed_demo)',
      },
    })
  })

  const empresaId = empresa.id_empresa
  console.log(`🏢 Empresa: ${empresa.nombre} (id=${empresaId})`)

  // 2) Crear catálogos por empresa si no existen (enfermedades/medicamentos básicos)
  //    Solo si están vacíos (porque tu seed base no los metió)
  if (!enfermedades.length) {
    await prisma.enfermedades.createMany({
      data: [
        { empresa_id: empresaId, empresa_id_u: empresaId, codigo: 'mastitis', nombre: 'Mastitis', tipo: 'bovina' },
        { empresa_id: empresaId, empresa_id_u: empresaId, codigo: 'fiebre', nombre: 'Fiebre', tipo: 'general' },
        { empresa_id: empresaId, empresa_id_u: empresaId, codigo: 'cojera', nombre: 'Cojera', tipo: 'general' },
      ],
      skipDuplicates: true,
    })
  }
  if (!medicamentos.length) {
    await prisma.medicamentos.createMany({
      data: [
        { empresa_id: empresaId, empresa_id_u: empresaId, codigo: 'ATB-01', nombre: 'Antibiótico A', principio_activo: 'Amoxicilina' },
        { empresa_id: empresaId, empresa_id_u: empresaId, codigo: 'AIN-01', nombre: 'Antiinflamatorio', principio_activo: 'Flunixina' },
        { empresa_id: empresaId, empresa_id_u: empresaId, codigo: 'VIT-01', nombre: 'Complejo vitamínico', principio_activo: 'Vitaminas' },
      ],
      skipDuplicates: true,
    })
  }

  const enfermedadesEmp = await prisma.enfermedades.findMany({
    where: { OR: [{ empresa_id: null }, { empresa_id: empresaId }] },
  })
  const medicamentosEmp = await prisma.medicamentos.findMany({
    where: { OR: [{ empresa_id: null }, { empresa_id: empresaId }] },
  })

  // 3) Usuario admin DEMO
  const admin = await prisma.usuarios.upsert({
    where: { email: DEMO.adminEmail },
    update: { nombre: DEMO.adminNombre, activo: true },
    create: {
      email: DEMO.adminEmail,
      nombre: DEMO.adminNombre,
      activo: true,
      // password_hash: null (demo)
    },
  })
  console.log(`👤 Usuario admin: ${admin.email} (id=${admin.id_usuario})`)

  // 4) Roles: asegurar roles base por empresa (Admin Empresa / Admin Finca)
  const ambitoEmpresa = await prisma.ambitos_rol.findUnique({ where: { codigo: 'empresa' } })
  const ambitoFinca = await prisma.ambitos_rol.findUnique({ where: { codigo: 'finca' } })
  if (!ambitoEmpresa || !ambitoFinca) throw new Error('ambitos_rol faltan. Corre seed base.')

  const rolAdminEmpresa = await prisma.roles.upsert({
    where: {
      // unique composite: @@unique([empresa_id, codigo])
      empresa_id_codigo: { empresa_id: empresaId, codigo: 'ADMIN_EMPRESA' } as any,
    },
    update: { nombre: 'Administrador Empresa', activo: true, id_ambito_rol: ambitoEmpresa.id_ambito_rol },
    create: {
      empresa_id: empresaId,
      id_ambito_rol: ambitoEmpresa.id_ambito_rol,
      codigo: 'ADMIN_EMPRESA',
      nombre: 'Administrador Empresa',
      activo: true,
      descripcion: 'Acceso total a nivel empresa',
    },
  }).catch(async () => {
    // Fallback if Prisma didn't generate composite unique alias:
    const existing = await prisma.roles.findFirst({ where: { empresa_id: empresaId, codigo: 'ADMIN_EMPRESA' } })
    if (existing) return existing
    return prisma.roles.create({
      data: {
        empresa_id: empresaId,
        id_ambito_rol: ambitoEmpresa.id_ambito_rol,
        codigo: 'ADMIN_EMPRESA',
        nombre: 'Administrador Empresa',
        activo: true,
        descripcion: 'Acceso total a nivel empresa',
      },
    })
  })

  const rolAdminFinca = await prisma.roles.upsert({
    where: {
      empresa_id_codigo: { empresa_id: empresaId, codigo: 'ADMIN_FINCA' } as any,
    },
    update: { nombre: 'Administrador Finca', activo: true, id_ambito_rol: ambitoFinca.id_ambito_rol },
    create: {
      empresa_id: empresaId,
      id_ambito_rol: ambitoFinca.id_ambito_rol,
      codigo: 'ADMIN_FINCA',
      nombre: 'Administrador Finca',
      activo: true,
      descripcion: 'Acceso total a nivel finca',
    },
  }).catch(async () => {
    const existing = await prisma.roles.findFirst({ where: { empresa_id: empresaId, codigo: 'ADMIN_FINCA' } })
    if (existing) return existing
    return prisma.roles.create({
      data: {
        empresa_id: empresaId,
        id_ambito_rol: ambitoFinca.id_ambito_rol,
        codigo: 'ADMIN_FINCA',
        nombre: 'Administrador Finca',
        activo: true,
        descripcion: 'Acceso total a nivel finca',
      },
    })
  })

  // 5) Vincular admin a empresa (usuario_empresas)
  await prisma.usuario_empresas.upsert({
    where: {
      id_usuario_id_empresa: { id_usuario: admin.id_usuario, id_empresa: empresaId } as any,
    },
    update: { id_rol: rolAdminEmpresa.id_rol, estado: 'activo', es_activa: true },
    create: {
      id_usuario: admin.id_usuario,
      id_empresa: empresaId,
      id_rol: rolAdminEmpresa.id_rol,
      estado: 'activo',
      es_activa: true,
    },
  }).catch(async () => {
    const existing = await prisma.usuario_empresas.findUnique({
      where: { id_usuario_id_empresa: { id_usuario: admin.id_usuario, id_empresa: empresaId } as any },
    })
    if (existing) {
      await prisma.usuario_empresas.update({
        where: { id_usuario_id_empresa: { id_usuario: admin.id_usuario, id_empresa: empresaId } as any },
        data: { id_rol: rolAdminEmpresa.id_rol, estado: 'activo', es_activa: true },
      })
      return
    }
    await prisma.usuario_empresas.create({
      data: {
        id_usuario: admin.id_usuario,
        id_empresa: empresaId,
        id_rol: rolAdminEmpresa.id_rol,
        estado: 'activo',
        es_activa: true,
      },
    })
  })

  // 6) Finca demo
  const fincaExisting = await prisma.fincas.findFirst({
    where: { empresa_id: empresaId, nombre: DEMO.fincaNombre },
  })
  const finca = fincaExisting
    ? await prisma.fincas.update({
        where: { id_finca_empresa_id: { id_finca: fincaExisting.id_finca, empresa_id: empresaId } as any },
        data: { moneda_base_id: monedaCOP.id_moneda, area_hectareas: decimal(150), notas: 'Finca demo (seed_demo)' },
      }).catch(() =>
        prisma.fincas.update({
          where: { id_finca_empresa_id: { id_finca: fincaExisting.id_finca, empresa_id: empresaId } as any },
          data: { moneda_base_id: monedaCOP.id_moneda },
        }),
      )
    : await prisma.fincas.create({
        data: {
          empresa_id: empresaId,
          nombre: DEMO.fincaNombre,
          moneda_base_id: monedaCOP.id_moneda,
          area_hectareas: decimal(150),
          direccion: 'Zona rural - Demo',
          notas: 'Finca demo (seed_demo)',
        },
      })

  console.log(`🌿 Finca: ${finca.nombre} (id_finca=${finca.id_finca}, empresa_id=${empresaId})`)

  // 7) Vincular admin a finca (usuario_fincas)
  await prisma.usuario_fincas.upsert({
    where: {
      id_usuario_id_finca_empresa_id: {
        id_usuario: admin.id_usuario,
        id_finca: finca.id_finca,
        empresa_id: empresaId,
      } as any,
    },
    update: { id_rol: rolAdminFinca.id_rol },
    create: {
      id_usuario: admin.id_usuario,
      id_finca: finca.id_finca,
      empresa_id: empresaId,
      id_rol: rolAdminFinca.id_rol,
      desde: dateOnly(daysAgo(365)),
    },
  }).catch(async () => {
    const existing = await prisma.usuario_fincas.findUnique({
      where: {
        id_usuario_id_finca_empresa_id: {
          id_usuario: admin.id_usuario,
          id_finca: finca.id_finca,
          empresa_id: empresaId,
        } as any,
      },
    })
    if (existing) {
      await prisma.usuario_fincas.update({
        where: {
          id_usuario_id_finca_empresa_id: {
            id_usuario: admin.id_usuario,
            id_finca: finca.id_finca,
            empresa_id: empresaId,
          } as any,
        },
        data: { id_rol: rolAdminFinca.id_rol },
      })
      return
    }
    await prisma.usuario_fincas.create({
      data: {
        id_usuario: admin.id_usuario,
        id_finca: finca.id_finca,
        empresa_id: empresaId,
        id_rol: rolAdminFinca.id_rol,
        desde: dateOnly(daysAgo(365)),
      },
    })
  })

  // 8) Crear Centro de recepción (para entregas/liquidaciones de leche)
  const centroExisting = await prisma.centros_recepcion.findFirst({
    where: { empresa_id: empresaId, nombre: DEMO.centroRecepcionNombre },
  })
  const centro = centroExisting
    ? centroExisting
    : await prisma.centros_recepcion.create({
        data: {
          empresa_id: empresaId,
          nombre: DEMO.centroRecepcionNombre,
          contacto: 'Recepción Demo',
          telefono: '+57 300 000 0000',
          notas: 'Centro demo (seed_demo)',
        },
      })

  // 9) Lotes demo
  const loteNombres = ['Lote Norte', 'Lote Sur', 'Lote Este', 'Lote Oeste', 'Lote Central']
  const lotesExisting = await prisma.lotes.findMany({ where: { empresa_id: empresaId, id_finca: finca.id_finca } })
  const lotesByName = new Map(lotesExisting.map((l) => [l.nombre, l]))

  const lotesCreated: { id_lote: bigint; empresa_id: bigint; nombre: string }[] = []
  for (const nombre of loteNombres) {
    const existing = lotesByName.get(nombre)
    if (existing) {
      lotesCreated.push({ id_lote: existing.id_lote, empresa_id: existing.empresa_id, nombre: existing.nombre })
      continue
    }
    const l = await prisma.lotes.create({
      data: {
        empresa_id: empresaId,
        id_finca: finca.id_finca,
        nombre,
        descripcion: `Descripción ${nombre}`,
        activo: true,
      },
    })
    lotesCreated.push({ id_lote: l.id_lote, empresa_id: l.empresa_id, nombre: l.nombre })
  }
  console.log(`🧩 Lotes: ${lotesCreated.length}`)

  // 10) Potreros demo (20)
  // We'll place them around a fictitious centroid in Colombia
  const baseLon = -74.1
  const baseLat = 4.65

  const potrerosExisting = await prisma.potreros.findMany({ where: { empresa_id: empresaId, id_finca: finca.id_finca } })
  const potrerosByName = new Map(potrerosExisting.map((p) => [p.nombre, p]))

  const estadoDisponible = estadosPotreros.find((e) => e.codigo === 'disponible') ?? estadosPotreros[0]
  const estadoOcupado = estadosPotreros.find((e) => e.codigo === 'ocupado') ?? estadosPotreros[0]

  const potrerosCreated: { id_potrero: bigint; empresa_id: bigint; nombre: string }[] = []
  for (let i = 1; i <= 20; i++) {
    const nombre = `Potrero ${String(i).padStart(2, '0')}`
    const existing = potrerosByName.get(nombre)
    if (existing) {
      potrerosCreated.push({ id_potrero: existing.id_potrero, empresa_id: existing.empresa_id, nombre: existing.nombre })
      continue
    }

    const lon = baseLon + faker.number.float({ min: -0.03, max: 0.03 })
    const lat = baseLat + faker.number.float({ min: -0.03, max: 0.03 })
    const geom = squarePolygon(lon, lat, faker.number.int({ min: 80, max: 160 }))

    const areaHa = faker.number.float({ min: 1.5, max: 6.5 })
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
        capacidad_animales: decimal(to2(areaHa * faker.number.float({ min: 2.2, max: 3.2 }))),
        notas: 'Potrero demo (seed_demo)',
      },
    })
    potrerosCreated.push({ id_potrero: p.id_potrero, empresa_id: p.empresa_id, nombre: p.nombre })
  }
  console.log(`🗺️ Potreros: ${potrerosCreated.length}`)

  // 11) Ocupación: crear 1 ocupación activa por lote (asignar lote -> potrero)
  // Your model uses is_active Unsupported("tinyint")? and unique by (empresa_id, id_lote, is_active)
  // We'll create "is_active = 1" for one potrero per lote.
  const existingOcup = await prisma.ocupacion_potreros.findMany({ where: { empresa_id: empresaId, id_finca: finca.id_finca } })
  const ocupKeys = new Set(existingOcup.map((o) => `${o.id_lote}:${String((o as any).is_active ?? '')}`))

  for (let i = 0; i < lotesCreated.length; i++) {
    const lote = lotesCreated[i]
    const potrero = potrerosCreated[i] ?? randPick(potrerosCreated)
    const key = `${lote.id_lote}:1`
    if (ocupKeys.has(key)) continue

    await prisma.ocupacion_potreros.create({
      data: {
        empresa_id: empresaId,
        id_finca: finca.id_finca,
        id_lote: lote.id_lote,
        id_potrero: potrero.id_potrero,
        fecha_inicio: dateOnly(daysAgo(faker.number.int({ min: 30, max: 120 }))),
        fecha_fin: null,
        notas: 'Ocupación activa demo',
      },
    }).catch(() => {
      // ignore if unique collisions
    })

    // Mark potrero as ocupado
    await prisma.potreros.update({
      where: { id_potrero_empresa_id: { id_potrero: potrero.id_potrero, empresa_id: empresaId } as any },
      data: { id_estado_potrero: estadoOcupado.id_estado_potrero },
    }).catch(() => {})
  }
  console.log(`🧱 Ocupaciones creadas/verificadas.`)

  // 12) Animales demo
  // We'll create 120 animals, with a mix of sexes/categories and some family relations.
  const animalesExisting = await prisma.animales.findMany({
    where: { empresa_id: empresaId, id_finca: finca.id_finca },
    select: { id_animal: true, empresa_id: true, sexo: true, nombre: true, fecha_nacimiento: true },
  })

  const targetAnimales = 120
  let toCreate = Math.max(0, targetAnimales - animalesExisting.length)
  console.log(`🐄 Animales existentes: ${animalesExisting.length}. A crear: ${toCreate}`)

  // Create base animals
  const createdAnimales: { id_animal: bigint; empresa_id: bigint; sexo: string; fecha_nacimiento: Date | null }[] = []
  if (toCreate > 0) {
    for (let i = 0; i < toCreate; i++) {
      const sexo = faker.helpers.weightedArrayElement([
        { weight: 70, value: 'F' },
        { weight: 30, value: 'M' },
      ])

      const ageDays = faker.number.int({ min: 60, max: 8 * 365 }) // 2 months to 8 years
      const birth = dateOnly(daysAgo(ageDays))

      const animal = await prisma.animales.create({
        data: {
          empresa_id: empresaId,
          id_finca: finca.id_finca,
          lote_actual_id: randPick(lotesCreated).id_lote,
          nombre: sexo === 'F' ? faker.person.firstName('female') : faker.person.firstName('male'),
          sexo,
          fecha_nacimiento: birth,
          fecha_nacimiento_estimada: faker.datatype.boolean({ probability: 0.25 }),
          foto_url: null,
          notas: 'Animal demo',
        },
        select: { id_animal: true, empresa_id: true, sexo: true, fecha_nacimiento: true },
      })
      createdAnimales.push(animal)
    }
  }

  // Re-query all animals
  const allAnimales = await prisma.animales.findMany({
    where: { empresa_id: empresaId, id_finca: finca.id_finca },
    select: {
      id_animal: true,
      empresa_id: true,
      sexo: true,
      fecha_nacimiento: true,
      madre_id: true,
      padre_id: true,
    },
  })

  // 13) Identificaciones (arete, microchip)
  const tipoArete = tiposIdent.find((t) => t.codigo === 'arete') ?? tiposIdent[0]
  const tipoChip = tiposIdent.find((t) => t.codigo === 'microchip') ?? tiposIdent[0]

  // Add identifications for newly created animals only (best effort)
  for (const a of createdAnimales) {
    const areteValue = `AR-${faker.number.int({ min: 100000, max: 999999 })}`
    await prisma.animal_identificaciones.create({
      data: {
        empresa_id: empresaId,
        id_animal: a.id_animal,
        id_tipo_identificacion: tipoArete.id_tipo_identificacion,
        valor: areteValue,
        fecha_asignacion: dateOnly(daysAgo(faker.number.int({ min: 1, max: 1200 }))),
        activo: true,
        es_principal: true,
        observaciones: null,
      },
    }).catch(() => {
      // ignore duplicates (unique [empresa_id, id_tipo_identificacion, valor])
    })

    if (faker.datatype.boolean({ probability: 0.4 })) {
      const chipValue = `CHIP-${faker.number.int({ min: 100000000, max: 999999999 })}`
      await prisma.animal_identificaciones.create({
        data: {
          empresa_id: empresaId,
          id_animal: a.id_animal,
          id_tipo_identificacion: tipoChip.id_tipo_identificacion,
          valor: chipValue,
          fecha_asignacion: dateOnly(daysAgo(faker.number.int({ min: 1, max: 1200 }))),
          activo: true,
          es_principal: false,
          observaciones: null,
        },
      }).catch(() => {})
    }
  }

  // 14) Categoría/Estado historial (simple: 1 registro actual por animal)
  const estadoActivo = estadosAnimales.find((e) => e.codigo === 'activo') ?? estadosAnimales[0]
  const estadoVendido = estadosAnimales.find((e) => e.codigo === 'vendido') ?? estadosAnimales[0]

  // Pick categories by sex
  const catsF = categoriasAnimales.filter((c) => c.sexo_requerido === 'F' || c.sexo_requerido == null)
  const catsM = categoriasAnimales.filter((c) => c.sexo_requerido === 'M' || c.sexo_requerido == null)

  for (const a of createdAnimales) {
    const cat = a.sexo === 'F' ? randPick(catsF) : randPick(catsM)
    const start = dateOnly(daysAgo(faker.number.int({ min: 10, max: 900 })))

    await prisma.animal_categorias_historial.create({
      data: {
        empresa_id: empresaId,
        id_animal: a.id_animal,
        id_categoria_animal: cat.id_categoria_animal,
        fecha_inicio: start,
        fecha_fin: null,
        observaciones: null,
      },
    }).catch(() => {})

    const isSold = faker.datatype.boolean({ probability: 0.06 })
    await prisma.animal_estados_historial.create({
      data: {
        empresa_id: empresaId,
        id_animal: a.id_animal,
        id_estado_animal: isSold ? estadoVendido.id_estado_animal : estadoActivo.id_estado_animal,
        fecha_inicio: start,
        fecha_fin: null,
        motivo: isSold ? 'Venta demo' : null,
      },
    }).catch(() => {})
  }

  // 15) Parent relations: assign some mothers/fathers
  // We'll update some young animals to reference adult mother/father
  const females = allAnimales.filter((a) => a.sexo === 'F')
  const males = allAnimales.filter((a) => a.sexo === 'M')
  const young = allAnimales.filter((a) => {
    if (!a.fecha_nacimiento) return false
    const ageDays = (Date.now() - new Date(a.fecha_nacimiento).getTime()) / (1000 * 60 * 60 * 24)
    return ageDays < 720 // < 2 years
  })

  for (const y of young.slice(0, Math.min(30, young.length))) {
    const madre = randPick(females)
    const padre = males.length ? randPick(males) : null
    await prisma.animales
      .update({
        where: { id_animal_empresa_id: { id_animal: y.id_animal, empresa_id: empresaId } as any },
        data: {
          madre_id: madre.id_animal,
          padre_id: padre ? padre.id_animal : null,
        },
      })
      .catch(() => {})
  }

  // 16) Movimientos de animales (50)
  const animalesForMov = await prisma.animales.findMany({
    where: { empresa_id: empresaId, id_finca: finca.id_finca },
    select: { id_animal: true, empresa_id: true },
    take: 200,
  })
  const movementsToCreate = 50
  for (let i = 0; i < movementsToCreate; i++) {
    const a = randPick(animalesForMov)
    const origen = randPick(lotesCreated)
    const destino = randPick(lotesCreated.filter((l) => l.id_lote !== origen.id_lote)) ?? origen
    const motivo = randPick(motivosMov)
    await prisma.movimientos_animales
      .create({
        data: {
          empresa_id: empresaId,
          id_finca: finca.id_finca,
          fecha_hora: new Date(daysAgo(faker.number.int({ min: 1, max: 180 }))),
          id_animal: a.id_animal,
          lote_origen_id: origen.id_lote,
          lote_destino_id: destino.id_lote,
          potrero_origen_id: null,
          potrero_destino_id: null,
          id_motivo_movimiento: motivo.id_motivo_movimiento,
          observaciones: 'Movimiento demo',
          created_by: admin.id_usuario,
        },
      })
      .catch(() => {})
  }

  // 17) Eventos sanitarios + tratamientos + retiros + recordatorios
  const animalesForSalud = await prisma.animales.findMany({
    where: { empresa_id: empresaId, id_finca: finca.id_finca },
    select: { id_animal: true, empresa_id: true },
    take: 200,
  })

  // If tipos_retiro not present, skip retiros
  const tipoRetLeche = await prisma.tipos_retiro.findFirst({ where: { codigo: 'LECHE' } })
  const tipoRetCarne = await prisma.tipos_retiro.findFirst({ where: { codigo: 'CARNE' } })

  const tiposRecordatorio = await prisma.tipos_recordatorio.findMany()
  const estadosRecord = await prisma.estados_recordatorio.findMany()

  const estadoPendiente = estadosRecord.find((e) => e.codigo === 'pendiente') ?? estadosRecord[0]
  const tipoRecVacuna = tiposRecordatorio.find((t) => t.codigo === 'vacuna') ?? tiposRecordatorio[0]
  const tipoRecRetLeche = tiposRecordatorio.find((t) => t.codigo === 'retiro_leche') ?? tiposRecordatorio[0]

  for (let i = 0; i < 20; i++) {
    const a = randPick(animalesForSalud)
    const enf = randPick(enfermedadesEmp)
    const fechaEv = dateOnly(daysAgo(faker.number.int({ min: 1, max: 200 })))
    const evento = await prisma.eventos_sanitarios
      .create({
        data: {
          empresa_id: empresaId,
          id_animal: a.id_animal,
          fecha: fechaEv,
          id_enfermedad: enf?.id_enfermedad ?? null,
          descripcion: 'Evento sanitario demo',
          created_by: admin.id_usuario,
        },
        select: { id_evento_sanitario: true },
      })
      .catch(() => null)

    if (!evento) continue

    // Tratamiento (70% probability)
    if (faker.datatype.boolean({ probability: 0.7 })) {
      const med = randPick(medicamentosEmp)
      const tr = await prisma.tratamientos
        .create({
          data: {
            empresa_id: empresaId,
            id_evento_sanitario: evento.id_evento_sanitario,
            id_animal: a.id_animal,
            fecha_inicio: fechaEv,
            id_medicamento: med.id_medicamento,
            dosis: '10 ml',
            via_administracion: 'IM',
            notas: 'Tratamiento demo',
            created_by: admin.id_usuario,
          },
          select: { id_tratamiento: true, fecha_inicio: true },
        })
        .catch(() => null)

      if (tr && (tipoRetLeche || tipoRetCarne) && faker.datatype.boolean({ probability: 0.6 })) {
        const dias = faker.number.int({ min: 2, max: 10 })
        const fin = new Date(tr.fecha_inicio)
        fin.setDate(fin.getDate() + dias)

        // Retiro (leche)
        if (tipoRetLeche) {
          const ret = await prisma.retiros
            .create({
              data: {
                id_tratamiento: tr.id_tratamiento,
                id_tipo_retiro: tipoRetLeche.id_tipo_retiro,
                dias_retiro: dias,
                fecha_inicio: tr.fecha_inicio,
                fecha_fin: dateOnly(fin),
                activo: true,
              },
              select: { id_retiro: true, fecha_fin: true },
            })
            .catch(() => null)

          if (ret) {
            // Recordatorio para fin de retiro leche
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
                },
              })
              .catch(() => {})
          }
        }
      }
    }

    // Recordatorio vacuna (random)
    if (faker.datatype.boolean({ probability: 0.35 })) {
      const future = new Date()
      future.setDate(future.getDate() + faker.number.int({ min: 3, max: 30 }))
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
          },
        })
        .catch(() => {})
    }
  }

  // 18) Eventos reproductivos (60) con algunos resultados palpación
  const hembras = await prisma.animales.findMany({
    where: { empresa_id: empresaId, id_finca: finca.id_finca, sexo: 'F' },
    select: { id_animal: true, empresa_id: true },
    take: 200,
  })
  const machos = await prisma.animales.findMany({
    where: { empresa_id: empresaId, id_finca: finca.id_finca, sexo: 'M' },
    select: { id_animal: true, empresa_id: true },
    take: 50,
  })

  for (let i = 0; i < 60; i++) {
    const hembra = randPick(hembras)
    const tipo = randPick(tiposEventoRep)
    const fecha = dateOnly(daysAgo(faker.number.int({ min: 1, max: 365 })))
    const reproductor = machos.length && faker.datatype.boolean({ probability: 0.6 }) ? randPick(machos) : null
    const isPalp = tipo.codigo === 'palpacion'
    const resPalp = isPalp ? randPick(resultadosPalp) : null

    const fechaEstParto =
      tipo.codigo === 'servicio' || tipo.codigo === 'celo'
        ? (() => {
            const d = new Date(fecha)
            d.setDate(d.getDate() + 283) // gestation rough
            return dateOnly(d)
          })()
        : null

    await prisma.eventos_reproductivos
      .create({
        data: {
          empresa_id: empresaId,
          id_animal: hembra.id_animal,
          id_tipo_evento_reproductivo: tipo.id_tipo_evento_reproductivo,
          fecha,
          detalles: 'Evento reproductivo demo',
          id_resultado_palpacion: resPalp?.id_resultado_palpacion ?? null,
          reproductor_id: reproductor?.id_animal ?? null,
          reproductor_identificacion: reproductor ? `TORO-${reproductor.id_animal}` : null,
          proveedor_semen: tipo.codigo === 'servicio' && faker.datatype.boolean({ probability: 0.35 }) ? 'Proveedor Demo' : null,
          codigo_pajuela: tipo.codigo === 'servicio' && faker.datatype.boolean({ probability: 0.35 }) ? `PJ-${faker.number.int({ min: 1000, max: 9999 })}` : null,
          fecha_estimada_parto: fechaEstParto,
          control_21_dias: (() => {
            const d = new Date(fecha)
            d.setDate(d.getDate() + 21)
            return dateOnly(d)
          })(),
          created_by: admin.id_usuario,
        },
      })
      .catch(() => {})
  }

  // 19) Producción leche (últimos 60 días) + pesajes por animal + entregas + liquidaciones
  const cowsMilk = hembras.slice(0, Math.min(25, hembras.length))
  const today = dateOnly(new Date())
  const startMilk = daysAgo(60)

  // Producción por finca (diaria) por turno
  for (let d = new Date(startMilk); d <= today; d.setDate(d.getDate() + 1)) {
    for (const turno of turnosOrdenio) {
      const litros = faker.number.float({ min: 80, max: 220 })
      await prisma.produccion_leche
        .create({
          data: {
            empresa_id: empresaId,
            id_finca: finca.id_finca,
            fecha: dateOnly(d),
            id_turno: turno.id_turno,
            litros: decimal(to2(litros)),
            notas: 'Producción demo',
            created_by: admin.id_usuario,
          },
        })
        .catch(() => {
          // ignore duplicates due to @@unique([empresa_id, id_finca, fecha, id_turno])
        })
    }

    // Pesajes por animal (solo algunos días)
    if (faker.datatype.boolean({ probability: 0.5 })) {
      const chosen = faker.helpers.arrayElements(cowsMilk, faker.number.int({ min: 6, max: Math.min(15, cowsMilk.length) }))
      const turno = randPick(turnosOrdenio)
      for (const cow of chosen) {
        const litros = faker.number.float({ min: 4, max: 18 })
        await prisma.pesajes_leche_animales
          .create({
            data: {
              empresa_id: empresaId,
              id_animal: cow.id_animal,
              fecha: dateOnly(d),
              id_turno: turno.id_turno,
              litros: decimal(to2(litros)),
              notas: 'Pesaje demo',
              created_by: admin.id_usuario,
            },
          })
          .catch(() => {})
      }
    }
  }

  // Entregas (10) en últimos 60 días
  const entregas: { id_entrega: bigint; fecha: Date; litros: number }[] = []
  for (let i = 0; i < 10; i++) {
    const fecha = dateOnly(daysAgo(faker.number.int({ min: 1, max: 60 })))
    const litros = faker.number.float({ min: 800, max: 2500 })
    const e = await prisma.entregas_leche
      .create({
        data: {
          empresa_id: empresaId,
          id_finca: finca.id_finca,
          id_centro: centro.id_centro,
          fecha,
          litros_entregados: decimal(to2(litros)),
          referencia_guia: `GUIA-${faker.number.int({ min: 10000, max: 99999 })}`,
          notas: 'Entrega demo',
          created_by: admin.id_usuario,
        },
        select: { id_entrega: true, fecha: true, litros_entregados: true },
      })
      .catch(() => null)

    if (e) entregas.push({ id_entrega: e.id_entrega, fecha: e.fecha, litros: Number(e.litros_entregados) })
  }

  // Liquidaciones (2) con moneda COP y tasa a USD opcional
  for (let i = 0; i < 2; i++) {
    const inicio = dateOnly(daysAgo(60 - i * 30))
    const fin = dateOnly(daysAgo(30 - i * 30))
    const litros = faker.number.float({ min: 6000, max: 14000 })
    const precio = faker.number.float({ min: 1500, max: 2400 }) // COP per liter (demo)
    const monto = litros * precio

    await prisma.liquidaciones_leche
      .create({
        data: {
          empresa_id: empresaId,
          id_finca: finca.id_finca,
          id_centro: centro.id_centro,
          fecha_inicio: inicio,
          fecha_fin: fin,
          litros_pagados: decimal(to2(litros)),
          precio_por_litro: decimal(to2(precio)),
          monto_pagado: decimal(to2(monto)),
          moneda_id: monedaCOP.id_moneda,
          tasa_cambio: null,
          notas: 'Liquidación demo',
          created_by: admin.id_usuario,
        },
      })
      .catch(() => {})
  }

  // 20) Finanzas: transacciones (30) + adjuntos (algunas)
  const categoriasFin = await prisma.categorias_financieras.findMany({
    where: { OR: [{ empresa_id: null }, { empresa_id: empresaId }] },
  })
  if (!categoriasFin.length) {
    console.warn('⚠️ categorias_financieras está vacío. Se omiten transacciones demo.')
  } else {
    const txs: { id_transaccion: bigint }[] = []
    for (let i = 0; i < 30; i++) {
      const cat = randPick(categoriasFin)
      const fecha = dateOnly(daysAgo(faker.number.int({ min: 1, max: 120 })))
      const monto = faker.number.float({ min: 30, max: 2500 })

      const t = await prisma.transacciones_financieras
        .create({
          data: {
            empresa_id: empresaId,
            fecha,
            id_tipo_transaccion: cat.id_tipo_transaccion,
            id_categoria_financiera: cat.id_categoria_financiera,
            monto: decimal(to2(monto)),
            descripcion: faker.lorem.sentence(),
            id_tercero: null,
            created_by: admin.id_usuario,
          },
          select: { id_transaccion: true },
        })
        .catch(() => null)

      if (t) txs.push(t)
    }

    const tipoAdj = tiposAdjunto.find((t) => t.codigo === 'pdf') ?? tiposAdjunto[0]
    for (const t of faker.helpers.arrayElements(txs, Math.min(10, txs.length))) {
      await prisma.adjuntos_transaccion
        .create({
          data: {
            id_transaccion: t.id_transaccion,
            id_tipo_adjunto: tipoAdj.id_tipo_adjunto,
            url_archivo: `https://example.com/demo/adjuntos/${t.id_transaccion}.pdf`,
            notas: 'Adjunto demo',
          },
        })
        .catch(() => {})
    }
  }

  // 21) (Opcional) Vacunaciones + vacunas si existe catálogo
  const vacunas = await prisma.vacunas.findMany({ where: { OR: [{ empresa_id: null }, { empresa_id: empresaId }] } })
  if (vacunas.length) {
    const animalesVac = await prisma.animales.findMany({
      where: { empresa_id: empresaId, id_finca: finca.id_finca },
      select: { id_animal: true, empresa_id: true },
      take: 200,
    })
    for (let i = 0; i < 25; i++) {
      const a = randPick(animalesVac)
      const v = randPick(vacunas)
      const fecha = dateOnly(daysAgo(faker.number.int({ min: 1, max: 200 })))
      await prisma.vacunaciones
        .create({
          data: {
            empresa_id: empresaId,
            fecha,
            id_vacuna: v.id_vacuna,
            id_animal: a.id_animal,
            lote_vacuna: `L-${faker.number.int({ min: 100, max: 999 })}`,
            costo: decimal(to2(faker.number.float({ min: 2, max: 25 }))),
            observaciones: 'Vacunación demo',
            created_by: admin.id_usuario,
          },
        })
        .catch(() => {})
    }
  }

  console.log('✅ Seed DEMO completado.')
}

seedDemo()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error seed DEMO:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
