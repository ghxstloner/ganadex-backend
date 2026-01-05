-- CreateTable
CREATE TABLE `adjuntos_transaccion` (
    `id_adjunto` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_transaccion` BIGINT UNSIGNED NOT NULL,
    `id_tipo_adjunto` BIGINT UNSIGNED NOT NULL,
    `url_archivo` VARCHAR(255) NOT NULL,
    `notas` TEXT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_at_tipo`(`id_tipo_adjunto`),
    INDEX `idx_at_transaccion`(`id_transaccion`),
    PRIMARY KEY (`id_adjunto`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `ambitos_rol` (
    `id_ambito_rol` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(30) NOT NULL,
    `nombre` VARCHAR(80) NOT NULL,

    UNIQUE INDEX `uq_ambitos_rol_codigo`(`codigo`),
    PRIMARY KEY (`id_ambito_rol`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `animal_categorias_historial` (
    `id_hist` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `empresa_id` BIGINT UNSIGNED NOT NULL,
    `id_animal` BIGINT UNSIGNED NOT NULL,
    `id_categoria_animal` BIGINT UNSIGNED NOT NULL,
    `fecha_inicio` DATE NOT NULL,
    `fecha_fin` DATE NULL,
    `observaciones` TEXT NULL,

    INDEX `idx_ac_animal`(`id_animal`, `empresa_id`, `fecha_inicio`),
    INDEX `idx_ac_categoria`(`id_categoria_animal`),
    PRIMARY KEY (`id_hist`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `animal_estados_historial` (
    `id_hist` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `empresa_id` BIGINT UNSIGNED NOT NULL,
    `id_animal` BIGINT UNSIGNED NOT NULL,
    `id_estado_animal` BIGINT UNSIGNED NOT NULL,
    `fecha_inicio` DATE NOT NULL,
    `fecha_fin` DATE NULL,
    `motivo` VARCHAR(255) NULL,

    INDEX `idx_ae_animal`(`id_animal`, `empresa_id`, `fecha_inicio`),
    INDEX `idx_ae_estado`(`id_estado_animal`),
    PRIMARY KEY (`id_hist`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `animal_identificaciones` (
    `id_animal_identificacion` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `empresa_id` BIGINT UNSIGNED NOT NULL,
    `id_animal` BIGINT UNSIGNED NOT NULL,
    `id_tipo_identificacion` BIGINT UNSIGNED NOT NULL,
    `valor` VARCHAR(120) NOT NULL,
    `fecha_asignacion` DATE NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `observaciones` TEXT NULL,

    INDEX `idx_ai_animal`(`id_animal`, `empresa_id`),
    INDEX `idx_ai_tipo`(`id_tipo_identificacion`),
    UNIQUE INDEX `uq_ai_empresa_tipo_valor`(`empresa_id`, `id_tipo_identificacion`, `valor`),
    PRIMARY KEY (`id_animal_identificacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `animales` (
    `id_animal` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `empresa_id` BIGINT UNSIGNED NOT NULL,
    `id_finca` BIGINT UNSIGNED NOT NULL,
    `nombre` VARCHAR(120) NULL,
    `sexo` CHAR(1) NOT NULL,
    `fecha_nacimiento` DATE NULL,
    `fecha_nacimiento_estimada` BOOLEAN NOT NULL DEFAULT false,
    `id_raza` BIGINT UNSIGNED NULL,
    `padre_id` BIGINT UNSIGNED NULL,
    `madre_id` BIGINT UNSIGNED NULL,
    `notas` TEXT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_animales_finca`(`id_finca`, `empresa_id`),
    INDEX `idx_animales_madre`(`madre_id`, `empresa_id`),
    INDEX `idx_animales_padre`(`padre_id`, `empresa_id`),
    INDEX `idx_animales_raza`(`id_raza`),
    PRIMARY KEY (`id_animal`, `empresa_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `auditoria_detalle` (
    `id_detalle` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_auditoria` BIGINT UNSIGNED NOT NULL,
    `empresa_id` BIGINT UNSIGNED NOT NULL,
    `id_animal` BIGINT UNSIGNED NULL,
    `id_tipo_identificacion` BIGINT UNSIGNED NULL,
    `valor_leido` VARCHAR(120) NULL,
    `encontrado` BOOLEAN NOT NULL DEFAULT false,
    `incidencia` VARCHAR(50) NULL,
    `notas` TEXT NULL,

    INDEX `fk_adet_empresa`(`empresa_id`),
    INDEX `fk_adet_tipo`(`id_tipo_identificacion`),
    INDEX `idx_adet_animal`(`id_animal`, `empresa_id`),
    INDEX `idx_adet_auditoria`(`id_auditoria`),
    PRIMARY KEY (`id_detalle`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `auditorias_inventario` (
    `id_auditoria` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `empresa_id` BIGINT UNSIGNED NOT NULL,
    `id_finca` BIGINT UNSIGNED NOT NULL,
    `fecha_apertura` DATETIME(0) NOT NULL,
    `fecha_cierre` DATETIME(0) NULL,
    `id_metodo_auditoria` BIGINT UNSIGNED NOT NULL,
    `estado` VARCHAR(20) NOT NULL DEFAULT 'abierta',
    `observaciones` TEXT NULL,
    `created_by` BIGINT UNSIGNED NULL,

    INDEX `fk_aud_created_by`(`created_by`),
    INDEX `fk_aud_metodo`(`id_metodo_auditoria`),
    INDEX `idx_aud_finca`(`id_finca`, `empresa_id`),
    PRIMARY KEY (`id_auditoria`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `categorias_animales` (
    `id_categoria_animal` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `empresa_id` BIGINT UNSIGNED NULL,
    `empresa_id_u` BIGINT UNSIGNED NULL,
    `codigo` VARCHAR(40) NOT NULL,
    `nombre` VARCHAR(120) NOT NULL,
    `sexo_requerido` CHAR(1) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `orden` INTEGER NOT NULL DEFAULT 0,

    INDEX `idx_ca_empresa`(`empresa_id`),
    UNIQUE INDEX `uq_ca_empresa_codigo`(`empresa_id_u`, `codigo`),
    PRIMARY KEY (`id_categoria_animal`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `categorias_financieras` (
    `id_categoria_financiera` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `empresa_id` BIGINT UNSIGNED NULL,
    `empresa_id_u` BIGINT UNSIGNED NULL,
    `codigo` VARCHAR(60) NOT NULL,
    `nombre` VARCHAR(140) NOT NULL,
    `id_tipo_transaccion` BIGINT UNSIGNED NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `orden` INTEGER NOT NULL DEFAULT 0,

    INDEX `idx_cf_empresa`(`empresa_id`),
    INDEX `idx_cf_tipo_tx`(`id_tipo_transaccion`),
    UNIQUE INDEX `uq_cf_empresa_codigo`(`empresa_id_u`, `codigo`),
    PRIMARY KEY (`id_categoria_financiera`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `centros_recepcion` (
    `id_centro` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `empresa_id` BIGINT UNSIGNED NOT NULL,
    `nombre` VARCHAR(160) NOT NULL,
    `contacto` VARCHAR(200) NULL,
    `telefono` VARCHAR(40) NULL,
    `notas` TEXT NULL,

    UNIQUE INDEX `uq_cr_empresa_nombre`(`empresa_id`, `nombre`),
    PRIMARY KEY (`id_centro`, `empresa_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `empresas` (
    `id_empresa` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(160) NOT NULL,
    `documento_fiscal` VARCHAR(60) NULL,
    `estado` VARCHAR(30) NOT NULL DEFAULT 'activa',
    `plan_id` BIGINT UNSIGNED NULL,
    `notas` TEXT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_empresas_plan`(`plan_id`),
    PRIMARY KEY (`id_empresa`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `enfermedades` (
    `id_enfermedad` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `empresa_id` BIGINT UNSIGNED NULL,
    `empresa_id_u` BIGINT UNSIGNED NULL,
    `codigo` VARCHAR(60) NOT NULL,
    `nombre` VARCHAR(140) NOT NULL,
    `tipo` VARCHAR(40) NULL,

    INDEX `idx_enf_empresa`(`empresa_id`),
    UNIQUE INDEX `uq_enf_empresa_codigo`(`empresa_id_u`, `codigo`),
    PRIMARY KEY (`id_enfermedad`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `entregas_leche` (
    `id_entrega` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `empresa_id` BIGINT UNSIGNED NOT NULL,
    `id_finca` BIGINT UNSIGNED NOT NULL,
    `id_centro` BIGINT UNSIGNED NOT NULL,
    `fecha` DATE NOT NULL,
    `litros_entregados` DECIMAL(12, 3) NOT NULL,
    `referencia_guia` VARCHAR(120) NULL,
    `notas` TEXT NULL,
    `created_by` BIGINT UNSIGNED NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_el_centro_fecha`(`id_centro`, `empresa_id`, `fecha`),
    INDEX `idx_el_created_by`(`created_by`),
    INDEX `idx_el_finca_fecha`(`id_finca`, `empresa_id`, `fecha`),
    PRIMARY KEY (`id_entrega`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `estados_animales` (
    `id_estado_animal` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `empresa_id` BIGINT UNSIGNED NULL,
    `empresa_id_u` BIGINT UNSIGNED NULL,
    `codigo` VARCHAR(40) NOT NULL,
    `nombre` VARCHAR(120) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,

    INDEX `idx_ea_empresa`(`empresa_id`),
    UNIQUE INDEX `uq_ea_empresa_codigo`(`empresa_id_u`, `codigo`),
    PRIMARY KEY (`id_estado_animal`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `estados_productivos` (
    `id_estado_productivo` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `empresa_id` BIGINT UNSIGNED NULL,
    `empresa_id_u` BIGINT UNSIGNED NULL,
    `codigo` VARCHAR(60) NOT NULL,
    `nombre` VARCHAR(140) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `orden` INTEGER NOT NULL DEFAULT 0,

    INDEX `idx_ep_empresa`(`empresa_id`),
    UNIQUE INDEX `uq_ep_empresa_codigo`(`empresa_id_u`, `codigo`),
    PRIMARY KEY (`id_estado_productivo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `estados_recordatorio` (
    `codigo` VARCHAR(30) NOT NULL,
    `nombre` VARCHAR(60) NOT NULL,
    `orden` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `eventos_reproductivos` (
    `id_evento_reproductivo` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `empresa_id` BIGINT UNSIGNED NOT NULL,
    `id_animal` BIGINT UNSIGNED NOT NULL,
    `id_tipo_evento_reproductivo` BIGINT UNSIGNED NOT NULL,
    `fecha` DATE NOT NULL,
    `detalles` TEXT NULL,
    `id_resultado_palpacion` BIGINT UNSIGNED NULL,
    `reproductor_id` BIGINT UNSIGNED NULL,
    `reproductor_identificacion` VARCHAR(120) NULL,
    `created_by` BIGINT UNSIGNED NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_er_animal_fecha`(`id_animal`, `empresa_id`, `fecha`),
    INDEX `idx_er_created_by`(`created_by`),
    INDEX `idx_er_reproductor`(`reproductor_id`, `empresa_id`),
    INDEX `idx_er_resultado`(`id_resultado_palpacion`),
    INDEX `idx_er_tipo`(`id_tipo_evento_reproductivo`),
    PRIMARY KEY (`id_evento_reproductivo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `eventos_sanitarios` (
    `id_evento_sanitario` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `empresa_id` BIGINT UNSIGNED NOT NULL,
    `id_animal` BIGINT UNSIGNED NOT NULL,
    `fecha` DATE NOT NULL,
    `id_enfermedad` BIGINT UNSIGNED NULL,
    `descripcion` TEXT NULL,
    `created_by` BIGINT UNSIGNED NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_es_animal_fecha`(`id_animal`, `empresa_id`, `fecha`),
    INDEX `idx_es_created_by`(`created_by`),
    INDEX `idx_es_enfermedad`(`id_enfermedad`),
    PRIMARY KEY (`id_evento_sanitario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `fincas` (
    `id_finca` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `empresa_id` BIGINT UNSIGNED NOT NULL,
    `nombre` VARCHAR(160) NOT NULL,
    `area_hectareas` DECIMAL(12, 2) NULL,
    `moneda_base_id` BIGINT UNSIGNED NOT NULL,
    `direccion` VARCHAR(255) NULL,
    `notas` TEXT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_fincas_moneda`(`moneda_base_id`),
    UNIQUE INDEX `uq_fincas_empresa_nombre`(`empresa_id`, `nombre`),
    PRIMARY KEY (`id_finca`, `empresa_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `lactancias` (
    `id_lactancia` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `empresa_id` BIGINT UNSIGNED NOT NULL,
    `id_animal` BIGINT UNSIGNED NOT NULL,
    `fecha_inicio` DATE NOT NULL,
    `fecha_fin` DATE NULL,
    `observaciones` TEXT NULL,

    INDEX `idx_lac_animal_inicio`(`id_animal`, `empresa_id`, `fecha_inicio`),
    PRIMARY KEY (`id_lactancia`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `liquidaciones_leche` (
    `id_liquidacion` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `empresa_id` BIGINT UNSIGNED NOT NULL,
    `id_finca` BIGINT UNSIGNED NOT NULL,
    `id_centro` BIGINT UNSIGNED NOT NULL,
    `fecha_inicio` DATE NOT NULL,
    `fecha_fin` DATE NOT NULL,
    `litros_pagados` DECIMAL(12, 3) NOT NULL,
    `precio_por_litro` DECIMAL(18, 6) NULL,
    `monto_pagado` DECIMAL(18, 2) NULL,
    `moneda_id` BIGINT UNSIGNED NOT NULL,
    `tasa_cambio` DECIMAL(18, 8) NULL,
    `notas` TEXT NULL,
    `created_by` BIGINT UNSIGNED NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_ll_centro_rango`(`id_centro`, `empresa_id`, `fecha_inicio`, `fecha_fin`),
    INDEX `idx_ll_created_by`(`created_by`),
    INDEX `idx_ll_finca_rango`(`id_finca`, `empresa_id`, `fecha_inicio`, `fecha_fin`),
    INDEX `idx_ll_moneda`(`moneda_id`),
    PRIMARY KEY (`id_liquidacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `lotes` (
    `id_lote` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `empresa_id` BIGINT UNSIGNED NOT NULL,
    `id_finca` BIGINT UNSIGNED NOT NULL,
    `nombre` VARCHAR(160) NOT NULL,
    `descripcion` TEXT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,

    INDEX `idx_lotes_finca`(`id_finca`, `empresa_id`),
    UNIQUE INDEX `uq_lotes_empresa_finca_nombre`(`empresa_id`, `id_finca`, `nombre`),
    PRIMARY KEY (`id_lote`, `empresa_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `medicamentos` (
    `id_medicamento` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `empresa_id` BIGINT UNSIGNED NULL,
    `empresa_id_u` BIGINT UNSIGNED NULL,
    `codigo` VARCHAR(60) NOT NULL,
    `nombre` VARCHAR(160) NOT NULL,
    `principio_activo` VARCHAR(160) NULL,

    INDEX `idx_med_empresa`(`empresa_id`),
    UNIQUE INDEX `uq_med_empresa_codigo`(`empresa_id_u`, `codigo`),
    PRIMARY KEY (`id_medicamento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `metodos_auditoria` (
    `id_metodo_auditoria` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `empresa_id` BIGINT UNSIGNED NULL,
    `empresa_id_u` BIGINT UNSIGNED NULL,
    `codigo` VARCHAR(60) NOT NULL,
    `nombre` VARCHAR(140) NOT NULL,

    INDEX `idx_ma_empresa`(`empresa_id`),
    UNIQUE INDEX `uq_ma_empresa_codigo`(`empresa_id_u`, `codigo`),
    PRIMARY KEY (`id_metodo_auditoria`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `monedas` (
    `id_moneda` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(10) NOT NULL,
    `nombre` VARCHAR(80) NOT NULL,
    `simbolo` VARCHAR(10) NULL,

    UNIQUE INDEX `uq_monedas_codigo`(`codigo`),
    PRIMARY KEY (`id_moneda`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `motivos_movimiento` (
    `id_motivo_movimiento` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `empresa_id` BIGINT UNSIGNED NULL,
    `empresa_id_u` BIGINT UNSIGNED NULL,
    `codigo` VARCHAR(60) NOT NULL,
    `nombre` VARCHAR(140) NOT NULL,

    INDEX `idx_mm_empresa`(`empresa_id`),
    UNIQUE INDEX `uq_mm_empresa_codigo`(`empresa_id_u`, `codigo`),
    PRIMARY KEY (`id_motivo_movimiento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `movimientos_animales` (
    `id_movimiento` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `empresa_id` BIGINT UNSIGNED NOT NULL,
    `id_finca` BIGINT UNSIGNED NOT NULL,
    `fecha_hora` DATETIME(0) NOT NULL,
    `id_animal` BIGINT UNSIGNED NOT NULL,
    `lote_origen_id` BIGINT UNSIGNED NULL,
    `lote_destino_id` BIGINT UNSIGNED NULL,
    `potrero_origen_id` BIGINT UNSIGNED NULL,
    `potrero_destino_id` BIGINT UNSIGNED NULL,
    `id_motivo_movimiento` BIGINT UNSIGNED NULL,
    `observaciones` TEXT NULL,
    `created_by` BIGINT UNSIGNED NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_mov_animal_fecha`(`id_animal`, `empresa_id`, `fecha_hora`),
    INDEX `idx_mov_created_by`(`created_by`),
    INDEX `idx_mov_finca_fecha`(`id_finca`, `empresa_id`, `fecha_hora`),
    INDEX `idx_mov_lote_dest`(`lote_destino_id`, `empresa_id`),
    INDEX `idx_mov_lote_origen`(`lote_origen_id`, `empresa_id`),
    INDEX `idx_mov_motivo`(`id_motivo_movimiento`),
    INDEX `idx_mov_pot_dest`(`potrero_destino_id`, `empresa_id`),
    INDEX `idx_mov_pot_origen`(`potrero_origen_id`, `empresa_id`),
    PRIMARY KEY (`id_movimiento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `ocupacion_potreros` (
    `id_ocupacion` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `empresa_id` BIGINT UNSIGNED NOT NULL,
    `id_finca` BIGINT UNSIGNED NOT NULL,
    `fecha_inicio` DATE NOT NULL,
    `fecha_fin` DATE NULL,
    `id_lote` BIGINT UNSIGNED NOT NULL,
    `id_potrero` BIGINT UNSIGNED NOT NULL,
    `notas` TEXT NULL,

    INDEX `idx_op_finca`(`id_finca`, `empresa_id`),
    INDEX `idx_op_lote`(`id_lote`, `empresa_id`, `fecha_inicio`),
    INDEX `idx_op_potrero`(`id_potrero`, `empresa_id`, `fecha_inicio`),
    PRIMARY KEY (`id_ocupacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `permisos` (
    `id_permiso` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(80) NOT NULL,
    `nombre` VARCHAR(140) NOT NULL,
    `descripcion` TEXT NULL,

    UNIQUE INDEX `uq_permisos_codigo`(`codigo`),
    PRIMARY KEY (`id_permiso`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `planes` (
    `id_plan` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(50) NOT NULL,
    `nombre` VARCHAR(120) NOT NULL,
    `descripcion` TEXT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uq_planes_codigo`(`codigo`),
    PRIMARY KEY (`id_plan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `potreros` (
    `id_potrero` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `empresa_id` BIGINT UNSIGNED NOT NULL,
    `id_finca` BIGINT UNSIGNED NOT NULL,
    `nombre` VARCHAR(160) NOT NULL,
    `area_hectareas` DECIMAL(12, 2) NULL,
    `id_tipo_potrero` BIGINT UNSIGNED NULL,
    `notas` TEXT NULL,

    INDEX `idx_potreros_finca`(`id_finca`, `empresa_id`),
    INDEX `idx_potreros_tipo`(`id_tipo_potrero`),
    UNIQUE INDEX `uq_potreros_empresa_finca_nombre`(`empresa_id`, `id_finca`, `nombre`),
    PRIMARY KEY (`id_potrero`, `empresa_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `produccion_leche` (
    `id_produccion` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `empresa_id` BIGINT UNSIGNED NOT NULL,
    `id_finca` BIGINT UNSIGNED NOT NULL,
    `fecha` DATE NOT NULL,
    `id_turno` BIGINT UNSIGNED NULL,
    `litros` DECIMAL(12, 3) NOT NULL,
    `notas` TEXT NULL,
    `created_by` BIGINT UNSIGNED NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_pl_created_by`(`created_by`),
    INDEX `idx_pl_finca_fecha`(`id_finca`, `empresa_id`, `fecha`),
    INDEX `idx_pl_turno`(`id_turno`),
    UNIQUE INDEX `uq_pl_finca_fecha_turno`(`empresa_id`, `id_finca`, `fecha`, `id_turno`),
    PRIMARY KEY (`id_produccion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `protocolo_ejecucion_tareas` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_ejecucion` BIGINT UNSIGNED NOT NULL,
    `id_tarea` BIGINT UNSIGNED NOT NULL,
    `completada` BOOLEAN NOT NULL DEFAULT false,
    `fecha` DATE NULL,
    `responsable` VARCHAR(160) NULL,
    `notas` TEXT NULL,

    INDEX `idx_pet_tarea`(`id_tarea`),
    UNIQUE INDEX `uq_pet_ejecucion_tarea`(`id_ejecucion`, `id_tarea`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `protocolo_ejecuciones` (
    `id_ejecucion` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `empresa_id` BIGINT UNSIGNED NOT NULL,
    `id_protocolo` BIGINT UNSIGNED NOT NULL,
    `id_animal` BIGINT UNSIGNED NOT NULL,
    `fecha_inicio` DATE NOT NULL,
    `fecha_cierre` DATE NULL,
    `observaciones` TEXT NULL,
    `created_by` BIGINT UNSIGNED NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_pe_animal`(`id_animal`, `empresa_id`, `fecha_inicio`),
    INDEX `idx_pe_created_by`(`created_by`),
    INDEX `idx_pe_protocolo`(`id_protocolo`),
    PRIMARY KEY (`id_ejecucion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `protocolo_tareas` (
    `id_tarea` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_protocolo` BIGINT UNSIGNED NOT NULL,
    `nombre` VARCHAR(160) NOT NULL,
    `dia_objetivo` INTEGER NOT NULL,
    `obligatorio` BOOLEAN NOT NULL DEFAULT true,

    INDEX `idx_pt_protocolo`(`id_protocolo`),
    PRIMARY KEY (`id_tarea`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `protocolos` (
    `id_protocolo` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `empresa_id` BIGINT UNSIGNED NULL,
    `empresa_id_u` BIGINT UNSIGNED NULL,
    `codigo` VARCHAR(60) NOT NULL,
    `nombre` VARCHAR(160) NOT NULL,
    `descripcion` TEXT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,

    INDEX `idx_pr_empresa`(`empresa_id`),
    UNIQUE INDEX `uq_pr_empresa_codigo`(`empresa_id_u`, `codigo`),
    PRIMARY KEY (`id_protocolo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `razas` (
    `id_raza` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `empresa_id` BIGINT UNSIGNED NULL,
    `empresa_id_u` BIGINT UNSIGNED NULL,
    `codigo` VARCHAR(60) NOT NULL,
    `nombre` VARCHAR(140) NOT NULL,

    INDEX `idx_razas_empresa`(`empresa_id`),
    UNIQUE INDEX `uq_razas_empresa_codigo`(`empresa_id_u`, `codigo`),
    PRIMARY KEY (`id_raza`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `recordatorios` (
    `id_recordatorio` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `empresa_id` BIGINT UNSIGNED NOT NULL,
    `id_tipo_recordatorio` BIGINT UNSIGNED NOT NULL,
    `id_animal` BIGINT UNSIGNED NULL,
    `fecha_programada` DATE NOT NULL,
    `descripcion` VARCHAR(200) NULL,
    `estado_codigo` VARCHAR(30) NOT NULL DEFAULT 'pendiente',
    `id_tratamiento` BIGINT UNSIGNED NULL,
    `id_retiro` BIGINT UNSIGNED NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_rec_retiro`(`id_retiro`),
    INDEX `fk_rec_tratamiento`(`id_tratamiento`),
    INDEX `idx_rec_animal`(`id_animal`, `empresa_id`),
    INDEX `idx_rec_empresa_fecha`(`empresa_id`, `fecha_programada`),
    INDEX `idx_rec_estado`(`estado_codigo`),
    INDEX `idx_rec_tipo`(`id_tipo_recordatorio`),
    PRIMARY KEY (`id_recordatorio`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `resultados_palpacion` (
    `id_resultado_palpacion` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `empresa_id` BIGINT UNSIGNED NULL,
    `empresa_id_u` BIGINT UNSIGNED NULL,
    `codigo` VARCHAR(40) NOT NULL,
    `nombre` VARCHAR(120) NOT NULL,

    INDEX `idx_rp_empresa`(`empresa_id`),
    UNIQUE INDEX `uq_rp_empresa_codigo`(`empresa_id_u`, `codigo`),
    PRIMARY KEY (`id_resultado_palpacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `retiros` (
    `id_retiro` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_tratamiento` BIGINT UNSIGNED NOT NULL,
    `id_tipo_retiro` BIGINT UNSIGNED NOT NULL,
    `dias_retiro` INTEGER NOT NULL,
    `fecha_inicio` DATE NOT NULL,
    `fecha_fin` DATE NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,

    INDEX `idx_ret_fechas`(`fecha_inicio`, `fecha_fin`),
    INDEX `idx_ret_tipo`(`id_tipo_retiro`),
    INDEX `idx_ret_tratamiento`(`id_tratamiento`),
    PRIMARY KEY (`id_retiro`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id_rol` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_ambito_rol` BIGINT UNSIGNED NOT NULL,
    `codigo` VARCHAR(50) NOT NULL,
    `nombre` VARCHAR(120) NOT NULL,
    `descripcion` TEXT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `uq_roles_codigo`(`codigo`),
    INDEX `idx_roles_ambito`(`id_ambito_rol`),
    PRIMARY KEY (`id_rol`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `roles_permisos` (
    `id_rol` BIGINT UNSIGNED NOT NULL,
    `id_permiso` BIGINT UNSIGNED NOT NULL,

    INDEX `idx_rp_permiso`(`id_permiso`),
    PRIMARY KEY (`id_rol`, `id_permiso`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `tasas_cambio` (
    `id_tasa` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `empresa_id` BIGINT UNSIGNED NULL,
    `empresa_id_u` BIGINT UNSIGNED NULL,
    `fecha` DATE NOT NULL,
    `moneda_origen_id` BIGINT UNSIGNED NOT NULL,
    `moneda_destino_id` BIGINT UNSIGNED NOT NULL,
    `tasa` DECIMAL(18, 8) NOT NULL,
    `fuente` VARCHAR(120) NULL,

    INDEX `idx_tc_dest`(`moneda_destino_id`),
    INDEX `idx_tc_empresa`(`empresa_id`),
    INDEX `idx_tc_origen`(`moneda_origen_id`),
    UNIQUE INDEX `uq_tc_fecha_par_empresa`(`empresa_id_u`, `fecha`, `moneda_origen_id`, `moneda_destino_id`),
    PRIMARY KEY (`id_tasa`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `tipos_adjunto` (
    `id_tipo_adjunto` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `empresa_id` BIGINT UNSIGNED NULL,
    `empresa_id_u` BIGINT UNSIGNED NULL,
    `codigo` VARCHAR(60) NOT NULL,
    `nombre` VARCHAR(140) NOT NULL,

    INDEX `idx_ta_empresa`(`empresa_id`),
    UNIQUE INDEX `uq_ta_empresa_codigo`(`empresa_id_u`, `codigo`),
    PRIMARY KEY (`id_tipo_adjunto`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `tipos_evento_reproductivo` (
    `id_tipo_evento_reproductivo` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `empresa_id` BIGINT UNSIGNED NULL,
    `empresa_id_u` BIGINT UNSIGNED NULL,
    `codigo` VARCHAR(40) NOT NULL,
    `nombre` VARCHAR(120) NOT NULL,

    INDEX `idx_ter_empresa`(`empresa_id`),
    UNIQUE INDEX `uq_ter_empresa_codigo`(`empresa_id_u`, `codigo`),
    PRIMARY KEY (`id_tipo_evento_reproductivo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `tipos_identificacion` (
    `id_tipo_identificacion` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `empresa_id` BIGINT UNSIGNED NULL,
    `empresa_id_u` BIGINT UNSIGNED NULL,
    `codigo` VARCHAR(40) NOT NULL,
    `nombre` VARCHAR(120) NOT NULL,

    INDEX `idx_ti_empresa`(`empresa_id`),
    UNIQUE INDEX `uq_ti_empresa_codigo`(`empresa_id_u`, `codigo`),
    PRIMARY KEY (`id_tipo_identificacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `tipos_potrero` (
    `id_tipo_potrero` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `empresa_id` BIGINT UNSIGNED NULL,
    `empresa_id_u` BIGINT UNSIGNED NULL,
    `codigo` VARCHAR(60) NOT NULL,
    `nombre` VARCHAR(140) NOT NULL,

    INDEX `idx_tp_empresa`(`empresa_id`),
    UNIQUE INDEX `uq_tp_empresa_codigo`(`empresa_id_u`, `codigo`),
    PRIMARY KEY (`id_tipo_potrero`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `tipos_recordatorio` (
    `id_tipo_recordatorio` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `empresa_id` BIGINT UNSIGNED NULL,
    `empresa_id_u` BIGINT UNSIGNED NULL,
    `codigo` VARCHAR(80) NOT NULL,
    `nombre` VARCHAR(160) NOT NULL,

    INDEX `idx_trc_empresa`(`empresa_id`),
    UNIQUE INDEX `uq_trc_empresa_codigo`(`empresa_id_u`, `codigo`),
    PRIMARY KEY (`id_tipo_recordatorio`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `tipos_retiro` (
    `id_tipo_retiro` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `empresa_id` BIGINT UNSIGNED NULL,
    `empresa_id_u` BIGINT UNSIGNED NULL,
    `codigo` VARCHAR(40) NOT NULL,
    `nombre` VARCHAR(120) NOT NULL,

    INDEX `idx_tr_empresa`(`empresa_id`),
    UNIQUE INDEX `uq_tr_empresa_codigo`(`empresa_id_u`, `codigo`),
    PRIMARY KEY (`id_tipo_retiro`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `tipos_transaccion` (
    `id_tipo_transaccion` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `empresa_id` BIGINT UNSIGNED NULL,
    `empresa_id_u` BIGINT UNSIGNED NULL,
    `codigo` VARCHAR(30) NOT NULL,
    `nombre` VARCHAR(120) NOT NULL,

    INDEX `idx_tt_empresa`(`empresa_id`),
    UNIQUE INDEX `uq_tt_empresa_codigo`(`empresa_id_u`, `codigo`),
    PRIMARY KEY (`id_tipo_transaccion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `transacciones_financieras` (
    `id_transaccion` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `empresa_id` BIGINT UNSIGNED NOT NULL,
    `fecha` DATE NOT NULL,
    `id_tipo_transaccion` BIGINT UNSIGNED NOT NULL,
    `id_categoria_financiera` BIGINT UNSIGNED NOT NULL,
    `monto` DECIMAL(18, 2) NOT NULL,
    `descripcion` TEXT NULL,
    `id_tercero` BIGINT UNSIGNED NULL,
    `created_by` BIGINT UNSIGNED NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_tf_created_by`(`created_by`),
    INDEX `idx_tf_cat`(`id_categoria_financiera`),
    INDEX `idx_tf_empresa_fecha`(`empresa_id`, `fecha`),
    INDEX `idx_tf_tipo`(`id_tipo_transaccion`),
    PRIMARY KEY (`id_transaccion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `tratamientos` (
    `id_tratamiento` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `empresa_id` BIGINT UNSIGNED NOT NULL,
    `id_evento_sanitario` BIGINT UNSIGNED NULL,
    `id_animal` BIGINT UNSIGNED NOT NULL,
    `fecha_inicio` DATE NOT NULL,
    `id_medicamento` BIGINT UNSIGNED NOT NULL,
    `dosis` VARCHAR(120) NULL,
    `via_administracion` VARCHAR(120) NULL,
    `notas` TEXT NULL,
    `created_by` BIGINT UNSIGNED NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_tr_animal_fecha`(`id_animal`, `empresa_id`, `fecha_inicio`),
    INDEX `idx_tr_created_by`(`created_by`),
    INDEX `idx_tr_evento`(`id_evento_sanitario`),
    INDEX `idx_tr_medicamento`(`id_medicamento`),
    PRIMARY KEY (`id_tratamiento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `turnos_ordenio` (
    `id_turno` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `empresa_id` BIGINT UNSIGNED NULL,
    `empresa_id_u` BIGINT UNSIGNED NULL,
    `codigo` VARCHAR(40) NOT NULL,
    `nombre` VARCHAR(120) NOT NULL,

    INDEX `idx_to_empresa`(`empresa_id`),
    UNIQUE INDEX `uq_to_empresa_codigo`(`empresa_id_u`, `codigo`),
    PRIMARY KEY (`id_turno`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `usuario_empresas` (
    `id_usuario` BIGINT UNSIGNED NOT NULL,
    `id_empresa` BIGINT UNSIGNED NOT NULL,
    `id_rol` BIGINT UNSIGNED NOT NULL,
    `estado` VARCHAR(20) NOT NULL DEFAULT 'activo',
    `es_activa` BOOLEAN NOT NULL DEFAULT false,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_ue_empresa`(`id_empresa`),
    INDEX `idx_ue_rol`(`id_rol`),
    PRIMARY KEY (`id_usuario`, `id_empresa`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `usuario_fincas` (
    `id_usuario` BIGINT UNSIGNED NOT NULL,
    `id_finca` BIGINT UNSIGNED NOT NULL,
    `empresa_id` BIGINT UNSIGNED NOT NULL,
    `id_rol` BIGINT UNSIGNED NOT NULL,
    `desde` DATE NULL,
    `hasta` DATE NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_uf_finca`(`id_finca`, `empresa_id`),
    INDEX `idx_uf_rol`(`id_rol`),
    PRIMARY KEY (`id_usuario`, `id_finca`, `empresa_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `usuarios` (
    `id_usuario` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(190) NOT NULL,
    `nombre` VARCHAR(120) NOT NULL,
    `telefono` VARCHAR(40) NULL,
    `password_hash` VARCHAR(255) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uq_usuarios_email`(`email`),
    PRIMARY KEY (`id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `vacunaciones` (
    `id_vacunacion` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `empresa_id` BIGINT UNSIGNED NOT NULL,
    `fecha` DATE NOT NULL,
    `id_vacuna` BIGINT UNSIGNED NOT NULL,
    `id_animal` BIGINT UNSIGNED NOT NULL,
    `lote_vacuna` VARCHAR(60) NULL,
    `costo` DECIMAL(18, 2) NULL,
    `observaciones` TEXT NULL,
    `created_by` BIGINT UNSIGNED NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_vacn_created_by`(`created_by`),
    INDEX `idx_vacn_animal`(`id_animal`, `empresa_id`),
    INDEX `idx_vacn_empresa_fecha`(`empresa_id`, `fecha`),
    INDEX `idx_vacn_vacuna`(`id_vacuna`),
    PRIMARY KEY (`id_vacunacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `vacunas` (
    `id_vacuna` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `empresa_id` BIGINT UNSIGNED NULL,
    `empresa_id_u` BIGINT UNSIGNED NULL,
    `codigo` VARCHAR(80) NOT NULL,
    `nombre` VARCHAR(160) NOT NULL,
    `descripcion` TEXT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,

    INDEX `idx_vac_empresa`(`empresa_id`),
    UNIQUE INDEX `uq_vac_empresa_codigo`(`empresa_id_u`, `codigo`),
    PRIMARY KEY (`id_vacuna`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- AddForeignKey
ALTER TABLE `adjuntos_transaccion` ADD CONSTRAINT `fk_at_tipo` FOREIGN KEY (`id_tipo_adjunto`) REFERENCES `tipos_adjunto`(`id_tipo_adjunto`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `adjuntos_transaccion` ADD CONSTRAINT `fk_at_transaccion` FOREIGN KEY (`id_transaccion`) REFERENCES `transacciones_financieras`(`id_transaccion`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `animal_categorias_historial` ADD CONSTRAINT `fk_ac_animal` FOREIGN KEY (`id_animal`, `empresa_id`) REFERENCES `animales`(`id_animal`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `animal_categorias_historial` ADD CONSTRAINT `fk_ac_categoria` FOREIGN KEY (`id_categoria_animal`) REFERENCES `categorias_animales`(`id_categoria_animal`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `animal_estados_historial` ADD CONSTRAINT `fk_ae_animal` FOREIGN KEY (`id_animal`, `empresa_id`) REFERENCES `animales`(`id_animal`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `animal_estados_historial` ADD CONSTRAINT `fk_ae_estado` FOREIGN KEY (`id_estado_animal`) REFERENCES `estados_animales`(`id_estado_animal`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `animal_identificaciones` ADD CONSTRAINT `fk_ai_animal` FOREIGN KEY (`id_animal`, `empresa_id`) REFERENCES `animales`(`id_animal`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `animal_identificaciones` ADD CONSTRAINT `fk_ai_tipo` FOREIGN KEY (`id_tipo_identificacion`) REFERENCES `tipos_identificacion`(`id_tipo_identificacion`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `animales` ADD CONSTRAINT `fk_animales_finca` FOREIGN KEY (`id_finca`, `empresa_id`) REFERENCES `fincas`(`id_finca`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `animales` ADD CONSTRAINT `fk_animales_madre` FOREIGN KEY (`madre_id`, `empresa_id`) REFERENCES `animales`(`id_animal`, `empresa_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `animales` ADD CONSTRAINT `fk_animales_padre` FOREIGN KEY (`padre_id`, `empresa_id`) REFERENCES `animales`(`id_animal`, `empresa_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `animales` ADD CONSTRAINT `fk_animales_raza` FOREIGN KEY (`id_raza`) REFERENCES `razas`(`id_raza`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auditoria_detalle` ADD CONSTRAINT `fk_adet_animal` FOREIGN KEY (`id_animal`, `empresa_id`) REFERENCES `animales`(`id_animal`, `empresa_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auditoria_detalle` ADD CONSTRAINT `fk_adet_auditoria` FOREIGN KEY (`id_auditoria`) REFERENCES `auditorias_inventario`(`id_auditoria`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auditoria_detalle` ADD CONSTRAINT `fk_adet_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id_empresa`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auditoria_detalle` ADD CONSTRAINT `fk_adet_tipo` FOREIGN KEY (`id_tipo_identificacion`) REFERENCES `tipos_identificacion`(`id_tipo_identificacion`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auditorias_inventario` ADD CONSTRAINT `fk_aud_created_by` FOREIGN KEY (`created_by`) REFERENCES `usuarios`(`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auditorias_inventario` ADD CONSTRAINT `fk_aud_finca` FOREIGN KEY (`id_finca`, `empresa_id`) REFERENCES `fincas`(`id_finca`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auditorias_inventario` ADD CONSTRAINT `fk_aud_metodo` FOREIGN KEY (`id_metodo_auditoria`) REFERENCES `metodos_auditoria`(`id_metodo_auditoria`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `categorias_animales` ADD CONSTRAINT `fk_ca_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id_empresa`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `categorias_financieras` ADD CONSTRAINT `fk_cf_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id_empresa`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `categorias_financieras` ADD CONSTRAINT `fk_cf_tipo_tx` FOREIGN KEY (`id_tipo_transaccion`) REFERENCES `tipos_transaccion`(`id_tipo_transaccion`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `centros_recepcion` ADD CONSTRAINT `fk_cr_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id_empresa`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `empresas` ADD CONSTRAINT `fk_empresas_plan` FOREIGN KEY (`plan_id`) REFERENCES `planes`(`id_plan`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `enfermedades` ADD CONSTRAINT `fk_enf_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id_empresa`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `entregas_leche` ADD CONSTRAINT `fk_el_centro` FOREIGN KEY (`id_centro`, `empresa_id`) REFERENCES `centros_recepcion`(`id_centro`, `empresa_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `entregas_leche` ADD CONSTRAINT `fk_el_created_by` FOREIGN KEY (`created_by`) REFERENCES `usuarios`(`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `entregas_leche` ADD CONSTRAINT `fk_el_finca` FOREIGN KEY (`id_finca`, `empresa_id`) REFERENCES `fincas`(`id_finca`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `estados_animales` ADD CONSTRAINT `fk_ea_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id_empresa`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `estados_productivos` ADD CONSTRAINT `fk_ep_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id_empresa`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `eventos_reproductivos` ADD CONSTRAINT `fk_er_animal` FOREIGN KEY (`id_animal`, `empresa_id`) REFERENCES `animales`(`id_animal`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `eventos_reproductivos` ADD CONSTRAINT `fk_er_created_by` FOREIGN KEY (`created_by`) REFERENCES `usuarios`(`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `eventos_reproductivos` ADD CONSTRAINT `fk_er_reproductor` FOREIGN KEY (`reproductor_id`, `empresa_id`) REFERENCES `animales`(`id_animal`, `empresa_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `eventos_reproductivos` ADD CONSTRAINT `fk_er_resultado` FOREIGN KEY (`id_resultado_palpacion`) REFERENCES `resultados_palpacion`(`id_resultado_palpacion`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `eventos_reproductivos` ADD CONSTRAINT `fk_er_tipo` FOREIGN KEY (`id_tipo_evento_reproductivo`) REFERENCES `tipos_evento_reproductivo`(`id_tipo_evento_reproductivo`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `eventos_sanitarios` ADD CONSTRAINT `fk_es_animal` FOREIGN KEY (`id_animal`, `empresa_id`) REFERENCES `animales`(`id_animal`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `eventos_sanitarios` ADD CONSTRAINT `fk_es_created_by` FOREIGN KEY (`created_by`) REFERENCES `usuarios`(`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `eventos_sanitarios` ADD CONSTRAINT `fk_es_enfermedad` FOREIGN KEY (`id_enfermedad`) REFERENCES `enfermedades`(`id_enfermedad`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fincas` ADD CONSTRAINT `fk_fincas_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id_empresa`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fincas` ADD CONSTRAINT `fk_fincas_moneda` FOREIGN KEY (`moneda_base_id`) REFERENCES `monedas`(`id_moneda`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lactancias` ADD CONSTRAINT `fk_lac_animal` FOREIGN KEY (`id_animal`, `empresa_id`) REFERENCES `animales`(`id_animal`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `liquidaciones_leche` ADD CONSTRAINT `fk_ll_centro` FOREIGN KEY (`id_centro`, `empresa_id`) REFERENCES `centros_recepcion`(`id_centro`, `empresa_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `liquidaciones_leche` ADD CONSTRAINT `fk_ll_created_by` FOREIGN KEY (`created_by`) REFERENCES `usuarios`(`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `liquidaciones_leche` ADD CONSTRAINT `fk_ll_finca` FOREIGN KEY (`id_finca`, `empresa_id`) REFERENCES `fincas`(`id_finca`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `liquidaciones_leche` ADD CONSTRAINT `fk_ll_moneda` FOREIGN KEY (`moneda_id`) REFERENCES `monedas`(`id_moneda`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lotes` ADD CONSTRAINT `fk_lotes_finca` FOREIGN KEY (`id_finca`, `empresa_id`) REFERENCES `fincas`(`id_finca`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medicamentos` ADD CONSTRAINT `fk_med_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id_empresa`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `metodos_auditoria` ADD CONSTRAINT `fk_ma_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id_empresa`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `motivos_movimiento` ADD CONSTRAINT `fk_mm_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id_empresa`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `movimientos_animales` ADD CONSTRAINT `fk_mov_animal` FOREIGN KEY (`id_animal`, `empresa_id`) REFERENCES `animales`(`id_animal`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimientos_animales` ADD CONSTRAINT `fk_mov_created_by` FOREIGN KEY (`created_by`) REFERENCES `usuarios`(`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimientos_animales` ADD CONSTRAINT `fk_mov_finca` FOREIGN KEY (`id_finca`, `empresa_id`) REFERENCES `fincas`(`id_finca`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimientos_animales` ADD CONSTRAINT `fk_mov_lote_dest` FOREIGN KEY (`lote_destino_id`, `empresa_id`) REFERENCES `lotes`(`id_lote`, `empresa_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimientos_animales` ADD CONSTRAINT `fk_mov_lote_origen` FOREIGN KEY (`lote_origen_id`, `empresa_id`) REFERENCES `lotes`(`id_lote`, `empresa_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimientos_animales` ADD CONSTRAINT `fk_mov_motivo` FOREIGN KEY (`id_motivo_movimiento`) REFERENCES `motivos_movimiento`(`id_motivo_movimiento`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimientos_animales` ADD CONSTRAINT `fk_mov_potrero_dest` FOREIGN KEY (`potrero_destino_id`, `empresa_id`) REFERENCES `potreros`(`id_potrero`, `empresa_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimientos_animales` ADD CONSTRAINT `fk_mov_potrero_origen` FOREIGN KEY (`potrero_origen_id`, `empresa_id`) REFERENCES `potreros`(`id_potrero`, `empresa_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ocupacion_potreros` ADD CONSTRAINT `fk_op_finca` FOREIGN KEY (`id_finca`, `empresa_id`) REFERENCES `fincas`(`id_finca`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ocupacion_potreros` ADD CONSTRAINT `fk_op_lote` FOREIGN KEY (`id_lote`, `empresa_id`) REFERENCES `lotes`(`id_lote`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ocupacion_potreros` ADD CONSTRAINT `fk_op_potrero` FOREIGN KEY (`id_potrero`, `empresa_id`) REFERENCES `potreros`(`id_potrero`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `potreros` ADD CONSTRAINT `fk_potreros_finca` FOREIGN KEY (`id_finca`, `empresa_id`) REFERENCES `fincas`(`id_finca`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `potreros` ADD CONSTRAINT `fk_potreros_tipo` FOREIGN KEY (`id_tipo_potrero`) REFERENCES `tipos_potrero`(`id_tipo_potrero`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `produccion_leche` ADD CONSTRAINT `fk_pl_created_by` FOREIGN KEY (`created_by`) REFERENCES `usuarios`(`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `produccion_leche` ADD CONSTRAINT `fk_pl_finca` FOREIGN KEY (`id_finca`, `empresa_id`) REFERENCES `fincas`(`id_finca`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `produccion_leche` ADD CONSTRAINT `fk_pl_turno` FOREIGN KEY (`id_turno`) REFERENCES `turnos_ordenio`(`id_turno`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `protocolo_ejecucion_tareas` ADD CONSTRAINT `fk_pet_ejecucion` FOREIGN KEY (`id_ejecucion`) REFERENCES `protocolo_ejecuciones`(`id_ejecucion`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `protocolo_ejecucion_tareas` ADD CONSTRAINT `fk_pet_tarea` FOREIGN KEY (`id_tarea`) REFERENCES `protocolo_tareas`(`id_tarea`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `protocolo_ejecuciones` ADD CONSTRAINT `fk_pe_animal` FOREIGN KEY (`id_animal`, `empresa_id`) REFERENCES `animales`(`id_animal`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `protocolo_ejecuciones` ADD CONSTRAINT `fk_pe_created_by` FOREIGN KEY (`created_by`) REFERENCES `usuarios`(`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `protocolo_ejecuciones` ADD CONSTRAINT `fk_pe_protocolo` FOREIGN KEY (`id_protocolo`) REFERENCES `protocolos`(`id_protocolo`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `protocolo_tareas` ADD CONSTRAINT `fk_pt_protocolo` FOREIGN KEY (`id_protocolo`) REFERENCES `protocolos`(`id_protocolo`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `protocolos` ADD CONSTRAINT `fk_pr_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id_empresa`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `razas` ADD CONSTRAINT `fk_razas_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id_empresa`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `recordatorios` ADD CONSTRAINT `fk_rec_animal` FOREIGN KEY (`id_animal`, `empresa_id`) REFERENCES `animales`(`id_animal`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recordatorios` ADD CONSTRAINT `fk_rec_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id_empresa`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recordatorios` ADD CONSTRAINT `fk_rec_estado` FOREIGN KEY (`estado_codigo`) REFERENCES `estados_recordatorio`(`codigo`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recordatorios` ADD CONSTRAINT `fk_rec_retiro` FOREIGN KEY (`id_retiro`) REFERENCES `retiros`(`id_retiro`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recordatorios` ADD CONSTRAINT `fk_rec_tipo` FOREIGN KEY (`id_tipo_recordatorio`) REFERENCES `tipos_recordatorio`(`id_tipo_recordatorio`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recordatorios` ADD CONSTRAINT `fk_rec_tratamiento` FOREIGN KEY (`id_tratamiento`) REFERENCES `tratamientos`(`id_tratamiento`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resultados_palpacion` ADD CONSTRAINT `fk_rp_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id_empresa`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `retiros` ADD CONSTRAINT `fk_ret_tipo` FOREIGN KEY (`id_tipo_retiro`) REFERENCES `tipos_retiro`(`id_tipo_retiro`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `retiros` ADD CONSTRAINT `fk_ret_tratamiento` FOREIGN KEY (`id_tratamiento`) REFERENCES `tratamientos`(`id_tratamiento`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `roles` ADD CONSTRAINT `fk_roles_ambito` FOREIGN KEY (`id_ambito_rol`) REFERENCES `ambitos_rol`(`id_ambito_rol`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `roles_permisos` ADD CONSTRAINT `fk_rp_permiso` FOREIGN KEY (`id_permiso`) REFERENCES `permisos`(`id_permiso`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `roles_permisos` ADD CONSTRAINT `fk_rp_rol` FOREIGN KEY (`id_rol`) REFERENCES `roles`(`id_rol`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasas_cambio` ADD CONSTRAINT `fk_tc_destino` FOREIGN KEY (`moneda_destino_id`) REFERENCES `monedas`(`id_moneda`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasas_cambio` ADD CONSTRAINT `fk_tc_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id_empresa`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tasas_cambio` ADD CONSTRAINT `fk_tc_origen` FOREIGN KEY (`moneda_origen_id`) REFERENCES `monedas`(`id_moneda`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tipos_adjunto` ADD CONSTRAINT `fk_ta_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id_empresa`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tipos_evento_reproductivo` ADD CONSTRAINT `fk_ter_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id_empresa`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tipos_identificacion` ADD CONSTRAINT `fk_ti_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id_empresa`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tipos_potrero` ADD CONSTRAINT `fk_tp_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id_empresa`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tipos_recordatorio` ADD CONSTRAINT `fk_trc_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id_empresa`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tipos_retiro` ADD CONSTRAINT `fk_tr_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id_empresa`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tipos_transaccion` ADD CONSTRAINT `fk_tt_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id_empresa`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `transacciones_financieras` ADD CONSTRAINT `fk_tf_categoria` FOREIGN KEY (`id_categoria_financiera`) REFERENCES `categorias_financieras`(`id_categoria_financiera`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transacciones_financieras` ADD CONSTRAINT `fk_tf_created_by` FOREIGN KEY (`created_by`) REFERENCES `usuarios`(`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transacciones_financieras` ADD CONSTRAINT `fk_tf_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id_empresa`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transacciones_financieras` ADD CONSTRAINT `fk_tf_tipo` FOREIGN KEY (`id_tipo_transaccion`) REFERENCES `tipos_transaccion`(`id_tipo_transaccion`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tratamientos` ADD CONSTRAINT `fk_tr_animal` FOREIGN KEY (`id_animal`, `empresa_id`) REFERENCES `animales`(`id_animal`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tratamientos` ADD CONSTRAINT `fk_tr_created_by` FOREIGN KEY (`created_by`) REFERENCES `usuarios`(`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tratamientos` ADD CONSTRAINT `fk_tr_evento` FOREIGN KEY (`id_evento_sanitario`) REFERENCES `eventos_sanitarios`(`id_evento_sanitario`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tratamientos` ADD CONSTRAINT `fk_tr_medicamento` FOREIGN KEY (`id_medicamento`) REFERENCES `medicamentos`(`id_medicamento`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `turnos_ordenio` ADD CONSTRAINT `fk_to_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id_empresa`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `usuario_empresas` ADD CONSTRAINT `fk_ue_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresas`(`id_empresa`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuario_empresas` ADD CONSTRAINT `fk_ue_rol` FOREIGN KEY (`id_rol`) REFERENCES `roles`(`id_rol`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuario_empresas` ADD CONSTRAINT `fk_ue_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuario_fincas` ADD CONSTRAINT `fk_uf_finca` FOREIGN KEY (`id_finca`, `empresa_id`) REFERENCES `fincas`(`id_finca`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuario_fincas` ADD CONSTRAINT `fk_uf_rol` FOREIGN KEY (`id_rol`) REFERENCES `roles`(`id_rol`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuario_fincas` ADD CONSTRAINT `fk_uf_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vacunaciones` ADD CONSTRAINT `fk_vacn_animal` FOREIGN KEY (`id_animal`, `empresa_id`) REFERENCES `animales`(`id_animal`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vacunaciones` ADD CONSTRAINT `fk_vacn_created_by` FOREIGN KEY (`created_by`) REFERENCES `usuarios`(`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vacunaciones` ADD CONSTRAINT `fk_vacn_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id_empresa`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vacunaciones` ADD CONSTRAINT `fk_vacn_vacuna` FOREIGN KEY (`id_vacuna`) REFERENCES `vacunas`(`id_vacuna`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vacunas` ADD CONSTRAINT `fk_vac_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id_empresa`) ON DELETE RESTRICT ON UPDATE RESTRICT;
