-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         8.4.7 - MySQL Community Server - GPL
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.14.0.7165
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Volcando estructura para tabla ganadex.adjuntos_transaccion
DROP TABLE IF EXISTS `adjuntos_transaccion`;
CREATE TABLE IF NOT EXISTS `adjuntos_transaccion` (
  `id_adjunto` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_transaccion` bigint unsigned NOT NULL,
  `id_tipo_adjunto` bigint unsigned NOT NULL,
  `url_archivo` varchar(255) NOT NULL,
  `notas` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_adjunto`),
  KEY `idx_at_transaccion` (`id_transaccion`),
  KEY `idx_at_tipo` (`id_tipo_adjunto`),
  CONSTRAINT `fk_at_tipo` FOREIGN KEY (`id_tipo_adjunto`) REFERENCES `tipos_adjunto` (`id_tipo_adjunto`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_at_transaccion` FOREIGN KEY (`id_transaccion`) REFERENCES `transacciones_financieras` (`id_transaccion`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.adjuntos_transaccion: ~0 rows (aproximadamente)

-- Volcando estructura para tabla ganadex.ambitos_rol
DROP TABLE IF EXISTS `ambitos_rol`;
CREATE TABLE IF NOT EXISTS `ambitos_rol` (
  `id_ambito_rol` bigint unsigned NOT NULL AUTO_INCREMENT,
  `codigo` varchar(30) NOT NULL,
  `nombre` varchar(80) NOT NULL,
  PRIMARY KEY (`id_ambito_rol`),
  UNIQUE KEY `uq_ambitos_rol_codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.ambitos_rol: ~2 rows (aproximadamente)
INSERT INTO `ambitos_rol` (`id_ambito_rol`, `codigo`, `nombre`) VALUES
	(1, 'empresa', 'Empresa'),
	(2, 'finca', 'Finca');

-- Volcando estructura para tabla ganadex.animal_categorias_historial
DROP TABLE IF EXISTS `animal_categorias_historial`;
CREATE TABLE IF NOT EXISTS `animal_categorias_historial` (
  `id_hist` bigint unsigned NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint unsigned NOT NULL,
  `id_animal` bigint unsigned NOT NULL,
  `id_categoria_animal` bigint unsigned NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `observaciones` text,
  PRIMARY KEY (`id_hist`),
  KEY `idx_ac_animal` (`id_animal`,`empresa_id`,`fecha_inicio`),
  KEY `idx_ac_categoria` (`id_categoria_animal`),
  CONSTRAINT `fk_ac_animal` FOREIGN KEY (`id_animal`, `empresa_id`) REFERENCES `animales` (`id_animal`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ac_categoria` FOREIGN KEY (`id_categoria_animal`) REFERENCES `categorias_animales` (`id_categoria_animal`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_ac_fechas` CHECK (((`fecha_fin` is null) or (`fecha_fin` >= `fecha_inicio`)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.animal_categorias_historial: ~0 rows (aproximadamente)

-- Volcando estructura para tabla ganadex.animal_estados_historial
DROP TABLE IF EXISTS `animal_estados_historial`;
CREATE TABLE IF NOT EXISTS `animal_estados_historial` (
  `id_hist` bigint unsigned NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint unsigned NOT NULL,
  `id_animal` bigint unsigned NOT NULL,
  `id_estado_animal` bigint unsigned NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_hist`),
  KEY `idx_ae_animal` (`id_animal`,`empresa_id`,`fecha_inicio`),
  KEY `idx_ae_estado` (`id_estado_animal`),
  CONSTRAINT `fk_ae_animal` FOREIGN KEY (`id_animal`, `empresa_id`) REFERENCES `animales` (`id_animal`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ae_estado` FOREIGN KEY (`id_estado_animal`) REFERENCES `estados_animales` (`id_estado_animal`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_ae_fechas` CHECK (((`fecha_fin` is null) or (`fecha_fin` >= `fecha_inicio`)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.animal_estados_historial: ~0 rows (aproximadamente)

-- Volcando estructura para tabla ganadex.animal_identificaciones
DROP TABLE IF EXISTS `animal_identificaciones`;
CREATE TABLE IF NOT EXISTS `animal_identificaciones` (
  `id_animal_identificacion` bigint unsigned NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint unsigned NOT NULL,
  `id_animal` bigint unsigned NOT NULL,
  `id_tipo_identificacion` bigint unsigned NOT NULL,
  `valor` varchar(120) NOT NULL,
  `fecha_asignacion` date NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `observaciones` text,
  PRIMARY KEY (`id_animal_identificacion`),
  UNIQUE KEY `uq_ai_empresa_tipo_valor` (`empresa_id`,`id_tipo_identificacion`,`valor`),
  KEY `idx_ai_animal` (`id_animal`,`empresa_id`),
  KEY `idx_ai_tipo` (`id_tipo_identificacion`),
  CONSTRAINT `fk_ai_animal` FOREIGN KEY (`id_animal`, `empresa_id`) REFERENCES `animales` (`id_animal`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ai_tipo` FOREIGN KEY (`id_tipo_identificacion`) REFERENCES `tipos_identificacion` (`id_tipo_identificacion`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.animal_identificaciones: ~0 rows (aproximadamente)

-- Volcando estructura para tabla ganadex.animales
DROP TABLE IF EXISTS `animales`;
CREATE TABLE IF NOT EXISTS `animales` (
  `id_animal` bigint unsigned NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint unsigned NOT NULL,
  `id_finca` bigint unsigned NOT NULL,
  `nombre` varchar(120) DEFAULT NULL,
  `sexo` char(1) NOT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `fecha_nacimiento_estimada` tinyint(1) NOT NULL DEFAULT '0',
  `id_raza` bigint unsigned DEFAULT NULL,
  `padre_id` bigint unsigned DEFAULT NULL,
  `madre_id` bigint unsigned DEFAULT NULL,
  `notas` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_animal`,`empresa_id`),
  KEY `idx_animales_finca` (`id_finca`,`empresa_id`),
  KEY `idx_animales_raza` (`id_raza`),
  KEY `idx_animales_padre` (`padre_id`,`empresa_id`),
  KEY `idx_animales_madre` (`madre_id`,`empresa_id`),
  CONSTRAINT `fk_animales_finca` FOREIGN KEY (`id_finca`, `empresa_id`) REFERENCES `fincas` (`id_finca`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_animales_madre` FOREIGN KEY (`madre_id`, `empresa_id`) REFERENCES `animales` (`id_animal`, `empresa_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_animales_padre` FOREIGN KEY (`padre_id`, `empresa_id`) REFERENCES `animales` (`id_animal`, `empresa_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_animales_raza` FOREIGN KEY (`id_raza`) REFERENCES `razas` (`id_raza`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `chk_animales_sexo` CHECK ((`sexo` in (_utf8mb4'M',_utf8mb4'F')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.animales: ~0 rows (aproximadamente)

-- Volcando estructura para tabla ganadex.auditoria_detalle
DROP TABLE IF EXISTS `auditoria_detalle`;
CREATE TABLE IF NOT EXISTS `auditoria_detalle` (
  `id_detalle` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_auditoria` bigint unsigned NOT NULL,
  `empresa_id` bigint unsigned NOT NULL,
  `id_animal` bigint unsigned DEFAULT NULL,
  `id_tipo_identificacion` bigint unsigned DEFAULT NULL,
  `valor_leido` varchar(120) DEFAULT NULL,
  `encontrado` tinyint(1) NOT NULL DEFAULT '0',
  `incidencia` varchar(50) DEFAULT NULL,
  `notas` text,
  PRIMARY KEY (`id_detalle`),
  KEY `idx_adet_auditoria` (`id_auditoria`),
  KEY `idx_adet_animal` (`id_animal`,`empresa_id`),
  KEY `fk_adet_empresa` (`empresa_id`),
  KEY `fk_adet_tipo` (`id_tipo_identificacion`),
  CONSTRAINT `fk_adet_animal` FOREIGN KEY (`id_animal`, `empresa_id`) REFERENCES `animales` (`id_animal`, `empresa_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_adet_auditoria` FOREIGN KEY (`id_auditoria`) REFERENCES `auditorias_inventario` (`id_auditoria`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_adet_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id_empresa`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_adet_tipo` FOREIGN KEY (`id_tipo_identificacion`) REFERENCES `tipos_identificacion` (`id_tipo_identificacion`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.auditoria_detalle: ~0 rows (aproximadamente)

-- Volcando estructura para tabla ganadex.auditorias_inventario
DROP TABLE IF EXISTS `auditorias_inventario`;
CREATE TABLE IF NOT EXISTS `auditorias_inventario` (
  `id_auditoria` bigint unsigned NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint unsigned NOT NULL,
  `id_finca` bigint unsigned NOT NULL,
  `fecha_apertura` datetime NOT NULL,
  `fecha_cierre` datetime DEFAULT NULL,
  `id_metodo_auditoria` bigint unsigned NOT NULL,
  `estado` varchar(20) NOT NULL DEFAULT 'abierta',
  `observaciones` text,
  `created_by` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id_auditoria`),
  KEY `idx_aud_finca` (`id_finca`,`empresa_id`),
  KEY `fk_aud_metodo` (`id_metodo_auditoria`),
  KEY `fk_aud_created_by` (`created_by`),
  CONSTRAINT `fk_aud_created_by` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_aud_finca` FOREIGN KEY (`id_finca`, `empresa_id`) REFERENCES `fincas` (`id_finca`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_aud_metodo` FOREIGN KEY (`id_metodo_auditoria`) REFERENCES `metodos_auditoria` (`id_metodo_auditoria`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.auditorias_inventario: ~0 rows (aproximadamente)

-- Volcando estructura para tabla ganadex.categorias_animales
DROP TABLE IF EXISTS `categorias_animales`;
CREATE TABLE IF NOT EXISTS `categorias_animales` (
  `id_categoria_animal` bigint unsigned NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint unsigned DEFAULT NULL,
  `empresa_id_u` bigint unsigned GENERATED ALWAYS AS (ifnull(`empresa_id`,0)) STORED,
  `codigo` varchar(40) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `sexo_requerido` char(1) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `orden` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_categoria_animal`),
  UNIQUE KEY `uq_ca_empresa_codigo` (`empresa_id_u`,`codigo`),
  KEY `idx_ca_empresa` (`empresa_id`),
  CONSTRAINT `fk_ca_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id_empresa`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.categorias_animales: ~8 rows (aproximadamente)
INSERT INTO `categorias_animales` (`id_categoria_animal`, `empresa_id`, `codigo`, `nombre`, `sexo_requerido`, `activo`, `orden`) VALUES
	(1, NULL, 'becerro', 'Becerro', 'M', 1, 10),
	(2, NULL, 'becerra', 'Becerra', 'F', 1, 11),
	(3, NULL, 'mauto', 'Mauto', 'M', 1, 20),
	(4, NULL, 'mauta', 'Mauta', 'F', 1, 21),
	(5, NULL, 'novillo', 'Novillo', 'M', 1, 30),
	(6, NULL, 'novilla', 'Novilla', 'F', 1, 31),
	(7, NULL, 'vaca', 'Vaca', 'F', 1, 40),
	(8, NULL, 'toro', 'Toro', 'M', 1, 41);

-- Volcando estructura para tabla ganadex.categorias_financieras
DROP TABLE IF EXISTS `categorias_financieras`;
CREATE TABLE IF NOT EXISTS `categorias_financieras` (
  `id_categoria_financiera` bigint unsigned NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint unsigned DEFAULT NULL,
  `empresa_id_u` bigint unsigned GENERATED ALWAYS AS (ifnull(`empresa_id`,0)) STORED,
  `codigo` varchar(60) NOT NULL,
  `nombre` varchar(140) NOT NULL,
  `id_tipo_transaccion` bigint unsigned NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `orden` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_categoria_financiera`),
  UNIQUE KEY `uq_cf_empresa_codigo` (`empresa_id_u`,`codigo`),
  KEY `idx_cf_empresa` (`empresa_id`),
  KEY `idx_cf_tipo_tx` (`id_tipo_transaccion`),
  CONSTRAINT `fk_cf_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id_empresa`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_cf_tipo_tx` FOREIGN KEY (`id_tipo_transaccion`) REFERENCES `tipos_transaccion` (`id_tipo_transaccion`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.categorias_financieras: ~0 rows (aproximadamente)

-- Volcando estructura para tabla ganadex.centros_recepcion
DROP TABLE IF EXISTS `centros_recepcion`;
CREATE TABLE IF NOT EXISTS `centros_recepcion` (
  `id_centro` bigint unsigned NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint unsigned NOT NULL,
  `nombre` varchar(160) NOT NULL,
  `contacto` varchar(200) DEFAULT NULL,
  `telefono` varchar(40) DEFAULT NULL,
  `notas` text,
  PRIMARY KEY (`id_centro`,`empresa_id`),
  UNIQUE KEY `uq_cr_empresa_nombre` (`empresa_id`,`nombre`),
  CONSTRAINT `fk_cr_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id_empresa`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.centros_recepcion: ~0 rows (aproximadamente)

-- Volcando estructura para tabla ganadex.empresas
DROP TABLE IF EXISTS `empresas`;
CREATE TABLE IF NOT EXISTS `empresas` (
  `id_empresa` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(160) NOT NULL,
  `documento_fiscal` varchar(60) DEFAULT NULL,
  `estado` varchar(30) NOT NULL DEFAULT 'activa',
  `plan_id` bigint unsigned DEFAULT NULL,
  `notas` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_empresa`),
  KEY `idx_empresas_plan` (`plan_id`),
  CONSTRAINT `fk_empresas_plan` FOREIGN KEY (`plan_id`) REFERENCES `planes` (`id_plan`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.empresas: ~0 rows (aproximadamente)

-- Volcando estructura para tabla ganadex.enfermedades
DROP TABLE IF EXISTS `enfermedades`;
CREATE TABLE IF NOT EXISTS `enfermedades` (
  `id_enfermedad` bigint unsigned NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint unsigned DEFAULT NULL,
  `empresa_id_u` bigint unsigned GENERATED ALWAYS AS (ifnull(`empresa_id`,0)) STORED,
  `codigo` varchar(60) NOT NULL,
  `nombre` varchar(140) NOT NULL,
  `tipo` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`id_enfermedad`),
  UNIQUE KEY `uq_enf_empresa_codigo` (`empresa_id_u`,`codigo`),
  KEY `idx_enf_empresa` (`empresa_id`),
  CONSTRAINT `fk_enf_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id_empresa`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.enfermedades: ~0 rows (aproximadamente)

-- Volcando estructura para tabla ganadex.entregas_leche
DROP TABLE IF EXISTS `entregas_leche`;
CREATE TABLE IF NOT EXISTS `entregas_leche` (
  `id_entrega` bigint unsigned NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint unsigned NOT NULL,
  `id_finca` bigint unsigned NOT NULL,
  `id_centro` bigint unsigned NOT NULL,
  `fecha` date NOT NULL,
  `litros_entregados` decimal(12,3) NOT NULL,
  `referencia_guia` varchar(120) DEFAULT NULL,
  `notas` text,
  `created_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_entrega`),
  KEY `idx_el_finca_fecha` (`id_finca`,`empresa_id`,`fecha`),
  KEY `idx_el_centro_fecha` (`id_centro`,`empresa_id`,`fecha`),
  KEY `idx_el_created_by` (`created_by`),
  CONSTRAINT `fk_el_centro` FOREIGN KEY (`id_centro`, `empresa_id`) REFERENCES `centros_recepcion` (`id_centro`, `empresa_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_el_created_by` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_el_finca` FOREIGN KEY (`id_finca`, `empresa_id`) REFERENCES `fincas` (`id_finca`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.entregas_leche: ~0 rows (aproximadamente)

-- Volcando estructura para tabla ganadex.estados_animales
DROP TABLE IF EXISTS `estados_animales`;
CREATE TABLE IF NOT EXISTS `estados_animales` (
  `id_estado_animal` bigint unsigned NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint unsigned DEFAULT NULL,
  `empresa_id_u` bigint unsigned GENERATED ALWAYS AS (ifnull(`empresa_id`,0)) STORED,
  `codigo` varchar(40) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_estado_animal`),
  UNIQUE KEY `uq_ea_empresa_codigo` (`empresa_id_u`,`codigo`),
  KEY `idx_ea_empresa` (`empresa_id`),
  CONSTRAINT `fk_ea_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id_empresa`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.estados_animales: ~3 rows (aproximadamente)
INSERT INTO `estados_animales` (`id_estado_animal`, `empresa_id`, `codigo`, `nombre`, `activo`) VALUES
	(1, NULL, 'activo', 'Activo', 1),
	(2, NULL, 'vendido', 'Vendido', 1),
	(3, NULL, 'muerto', 'Muerto', 1);

-- Volcando estructura para tabla ganadex.estados_productivos
DROP TABLE IF EXISTS `estados_productivos`;
CREATE TABLE IF NOT EXISTS `estados_productivos` (
  `id_estado_productivo` bigint unsigned NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint unsigned DEFAULT NULL,
  `empresa_id_u` bigint unsigned GENERATED ALWAYS AS (ifnull(`empresa_id`,0)) STORED,
  `codigo` varchar(60) NOT NULL,
  `nombre` varchar(140) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `orden` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_estado_productivo`),
  UNIQUE KEY `uq_ep_empresa_codigo` (`empresa_id_u`,`codigo`),
  KEY `idx_ep_empresa` (`empresa_id`),
  CONSTRAINT `fk_ep_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id_empresa`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.estados_productivos: ~4 rows (aproximadamente)
INSERT INTO `estados_productivos` (`id_estado_productivo`, `empresa_id`, `codigo`, `nombre`, `activo`, `orden`) VALUES
	(1, NULL, 'en_ordenio', 'En ordeño', 1, 10),
	(2, NULL, 'seca', 'Seca', 1, 20),
	(3, NULL, 'levante', 'Levante', 1, 30),
	(4, NULL, 'ceba', 'Ceba', 1, 40);

-- Volcando estructura para tabla ganadex.estados_recordatorio
DROP TABLE IF EXISTS `estados_recordatorio`;
CREATE TABLE IF NOT EXISTS `estados_recordatorio` (
  `codigo` varchar(30) NOT NULL,
  `nombre` varchar(60) NOT NULL,
  `orden` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.estados_recordatorio: ~3 rows (aproximadamente)
INSERT INTO `estados_recordatorio` (`codigo`, `nombre`, `orden`) VALUES
	('cancelado', 'Cancelado', 3),
	('completado', 'Completado', 2),
	('pendiente', 'Pendiente', 1);

-- Volcando estructura para tabla ganadex.eventos_reproductivos
DROP TABLE IF EXISTS `eventos_reproductivos`;
CREATE TABLE IF NOT EXISTS `eventos_reproductivos` (
  `id_evento_reproductivo` bigint unsigned NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint unsigned NOT NULL,
  `id_animal` bigint unsigned NOT NULL,
  `id_tipo_evento_reproductivo` bigint unsigned NOT NULL,
  `fecha` date NOT NULL,
  `detalles` text,
  `id_resultado_palpacion` bigint unsigned DEFAULT NULL,
  `reproductor_id` bigint unsigned DEFAULT NULL,
  `reproductor_identificacion` varchar(120) DEFAULT NULL,
  `created_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_evento_reproductivo`),
  KEY `idx_er_animal_fecha` (`id_animal`,`empresa_id`,`fecha`),
  KEY `idx_er_tipo` (`id_tipo_evento_reproductivo`),
  KEY `idx_er_resultado` (`id_resultado_palpacion`),
  KEY `idx_er_reproductor` (`reproductor_id`,`empresa_id`),
  KEY `idx_er_created_by` (`created_by`),
  CONSTRAINT `fk_er_animal` FOREIGN KEY (`id_animal`, `empresa_id`) REFERENCES `animales` (`id_animal`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_er_created_by` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_er_reproductor` FOREIGN KEY (`reproductor_id`, `empresa_id`) REFERENCES `animales` (`id_animal`, `empresa_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_er_resultado` FOREIGN KEY (`id_resultado_palpacion`) REFERENCES `resultados_palpacion` (`id_resultado_palpacion`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_er_tipo` FOREIGN KEY (`id_tipo_evento_reproductivo`) REFERENCES `tipos_evento_reproductivo` (`id_tipo_evento_reproductivo`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.eventos_reproductivos: ~0 rows (aproximadamente)

-- Volcando estructura para tabla ganadex.eventos_sanitarios
DROP TABLE IF EXISTS `eventos_sanitarios`;
CREATE TABLE IF NOT EXISTS `eventos_sanitarios` (
  `id_evento_sanitario` bigint unsigned NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint unsigned NOT NULL,
  `id_animal` bigint unsigned NOT NULL,
  `fecha` date NOT NULL,
  `id_enfermedad` bigint unsigned DEFAULT NULL,
  `descripcion` text,
  `created_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_evento_sanitario`),
  KEY `idx_es_animal_fecha` (`id_animal`,`empresa_id`,`fecha`),
  KEY `idx_es_enfermedad` (`id_enfermedad`),
  KEY `idx_es_created_by` (`created_by`),
  CONSTRAINT `fk_es_animal` FOREIGN KEY (`id_animal`, `empresa_id`) REFERENCES `animales` (`id_animal`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_es_created_by` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_es_enfermedad` FOREIGN KEY (`id_enfermedad`) REFERENCES `enfermedades` (`id_enfermedad`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.eventos_sanitarios: ~0 rows (aproximadamente)

-- Volcando estructura para tabla ganadex.fincas
DROP TABLE IF EXISTS `fincas`;
CREATE TABLE IF NOT EXISTS `fincas` (
  `id_finca` bigint unsigned NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint unsigned NOT NULL,
  `nombre` varchar(160) NOT NULL,
  `area_hectareas` decimal(12,2) DEFAULT NULL,
  `moneda_base_id` bigint unsigned NOT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `notas` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_finca`,`empresa_id`),
  UNIQUE KEY `uq_fincas_empresa_nombre` (`empresa_id`,`nombre`),
  KEY `idx_fincas_moneda` (`moneda_base_id`),
  CONSTRAINT `fk_fincas_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id_empresa`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_fincas_moneda` FOREIGN KEY (`moneda_base_id`) REFERENCES `monedas` (`id_moneda`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.fincas: ~0 rows (aproximadamente)

-- Volcando estructura para tabla ganadex.lactancias
DROP TABLE IF EXISTS `lactancias`;
CREATE TABLE IF NOT EXISTS `lactancias` (
  `id_lactancia` bigint unsigned NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint unsigned NOT NULL,
  `id_animal` bigint unsigned NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `observaciones` text,
  PRIMARY KEY (`id_lactancia`),
  KEY `idx_lac_animal_inicio` (`id_animal`,`empresa_id`,`fecha_inicio`),
  CONSTRAINT `fk_lac_animal` FOREIGN KEY (`id_animal`, `empresa_id`) REFERENCES `animales` (`id_animal`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_lac_fechas` CHECK (((`fecha_fin` is null) or (`fecha_fin` >= `fecha_inicio`)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.lactancias: ~0 rows (aproximadamente)

-- Volcando estructura para tabla ganadex.liquidaciones_leche
DROP TABLE IF EXISTS `liquidaciones_leche`;
CREATE TABLE IF NOT EXISTS `liquidaciones_leche` (
  `id_liquidacion` bigint unsigned NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint unsigned NOT NULL,
  `id_finca` bigint unsigned NOT NULL,
  `id_centro` bigint unsigned NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `litros_pagados` decimal(12,3) NOT NULL,
  `precio_por_litro` decimal(18,6) DEFAULT NULL,
  `monto_pagado` decimal(18,2) DEFAULT NULL,
  `moneda_id` bigint unsigned NOT NULL,
  `tasa_cambio` decimal(18,8) DEFAULT NULL,
  `notas` text,
  `created_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_liquidacion`),
  KEY `idx_ll_finca_rango` (`id_finca`,`empresa_id`,`fecha_inicio`,`fecha_fin`),
  KEY `idx_ll_centro_rango` (`id_centro`,`empresa_id`,`fecha_inicio`,`fecha_fin`),
  KEY `idx_ll_moneda` (`moneda_id`),
  KEY `idx_ll_created_by` (`created_by`),
  CONSTRAINT `fk_ll_centro` FOREIGN KEY (`id_centro`, `empresa_id`) REFERENCES `centros_recepcion` (`id_centro`, `empresa_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_ll_created_by` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_ll_finca` FOREIGN KEY (`id_finca`, `empresa_id`) REFERENCES `fincas` (`id_finca`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ll_moneda` FOREIGN KEY (`moneda_id`) REFERENCES `monedas` (`id_moneda`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_ll_fechas` CHECK ((`fecha_fin` >= `fecha_inicio`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.liquidaciones_leche: ~0 rows (aproximadamente)

-- Volcando estructura para tabla ganadex.lotes
DROP TABLE IF EXISTS `lotes`;
CREATE TABLE IF NOT EXISTS `lotes` (
  `id_lote` bigint unsigned NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint unsigned NOT NULL,
  `id_finca` bigint unsigned NOT NULL,
  `nombre` varchar(160) NOT NULL,
  `descripcion` text,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_lote`,`empresa_id`),
  UNIQUE KEY `uq_lotes_empresa_finca_nombre` (`empresa_id`,`id_finca`,`nombre`),
  KEY `idx_lotes_finca` (`id_finca`,`empresa_id`),
  CONSTRAINT `fk_lotes_finca` FOREIGN KEY (`id_finca`, `empresa_id`) REFERENCES `fincas` (`id_finca`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.lotes: ~0 rows (aproximadamente)

-- Volcando estructura para tabla ganadex.medicamentos
DROP TABLE IF EXISTS `medicamentos`;
CREATE TABLE IF NOT EXISTS `medicamentos` (
  `id_medicamento` bigint unsigned NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint unsigned DEFAULT NULL,
  `empresa_id_u` bigint unsigned GENERATED ALWAYS AS (ifnull(`empresa_id`,0)) STORED,
  `codigo` varchar(60) NOT NULL,
  `nombre` varchar(160) NOT NULL,
  `principio_activo` varchar(160) DEFAULT NULL,
  PRIMARY KEY (`id_medicamento`),
  UNIQUE KEY `uq_med_empresa_codigo` (`empresa_id_u`,`codigo`),
  KEY `idx_med_empresa` (`empresa_id`),
  CONSTRAINT `fk_med_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id_empresa`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.medicamentos: ~0 rows (aproximadamente)

-- Volcando estructura para tabla ganadex.metodos_auditoria
DROP TABLE IF EXISTS `metodos_auditoria`;
CREATE TABLE IF NOT EXISTS `metodos_auditoria` (
  `id_metodo_auditoria` bigint unsigned NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint unsigned DEFAULT NULL,
  `empresa_id_u` bigint unsigned GENERATED ALWAYS AS (ifnull(`empresa_id`,0)) STORED,
  `codigo` varchar(60) NOT NULL,
  `nombre` varchar(140) NOT NULL,
  PRIMARY KEY (`id_metodo_auditoria`),
  UNIQUE KEY `uq_ma_empresa_codigo` (`empresa_id_u`,`codigo`),
  KEY `idx_ma_empresa` (`empresa_id`),
  CONSTRAINT `fk_ma_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id_empresa`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.metodos_auditoria: ~2 rows (aproximadamente)
INSERT INTO `metodos_auditoria` (`id_metodo_auditoria`, `empresa_id`, `codigo`, `nombre`) VALUES
	(1, NULL, 'conteo_manual', 'Conteo manual'),
	(2, NULL, 'lector_chip', 'Lector de microchip');

-- Volcando estructura para tabla ganadex.monedas
DROP TABLE IF EXISTS `monedas`;
CREATE TABLE IF NOT EXISTS `monedas` (
  `id_moneda` bigint unsigned NOT NULL AUTO_INCREMENT,
  `codigo` varchar(10) NOT NULL,
  `nombre` varchar(80) NOT NULL,
  `simbolo` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id_moneda`),
  UNIQUE KEY `uq_monedas_codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.monedas: ~3 rows (aproximadamente)
INSERT INTO `monedas` (`id_moneda`, `codigo`, `nombre`, `simbolo`) VALUES
	(1, 'COP', 'Peso colombiano', '$'),
	(2, 'USD', 'Dólar estadounidense', '$'),
	(3, 'VES', 'Bolívar venezolano', 'Bs.');

-- Volcando estructura para tabla ganadex.motivos_movimiento
DROP TABLE IF EXISTS `motivos_movimiento`;
CREATE TABLE IF NOT EXISTS `motivos_movimiento` (
  `id_motivo_movimiento` bigint unsigned NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint unsigned DEFAULT NULL,
  `empresa_id_u` bigint unsigned GENERATED ALWAYS AS (ifnull(`empresa_id`,0)) STORED,
  `codigo` varchar(60) NOT NULL,
  `nombre` varchar(140) NOT NULL,
  PRIMARY KEY (`id_motivo_movimiento`),
  UNIQUE KEY `uq_mm_empresa_codigo` (`empresa_id_u`,`codigo`),
  KEY `idx_mm_empresa` (`empresa_id`),
  CONSTRAINT `fk_mm_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id_empresa`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.motivos_movimiento: ~5 rows (aproximadamente)
INSERT INTO `motivos_movimiento` (`id_motivo_movimiento`, `empresa_id`, `codigo`, `nombre`) VALUES
	(1, NULL, 'rotacion', 'Rotación'),
	(2, NULL, 'destete', 'Destete'),
	(3, NULL, 'secado', 'Secado'),
	(4, NULL, 'fuga', 'Fuga'),
	(5, NULL, 'ajuste_inventario', 'Ajuste de inventario');

-- Volcando estructura para tabla ganadex.movimientos_animales
DROP TABLE IF EXISTS `movimientos_animales`;
CREATE TABLE IF NOT EXISTS `movimientos_animales` (
  `id_movimiento` bigint unsigned NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint unsigned NOT NULL,
  `id_finca` bigint unsigned NOT NULL,
  `fecha_hora` datetime NOT NULL,
  `id_animal` bigint unsigned NOT NULL,
  `lote_origen_id` bigint unsigned DEFAULT NULL,
  `lote_destino_id` bigint unsigned DEFAULT NULL,
  `potrero_origen_id` bigint unsigned DEFAULT NULL,
  `potrero_destino_id` bigint unsigned DEFAULT NULL,
  `id_motivo_movimiento` bigint unsigned DEFAULT NULL,
  `observaciones` text,
  `created_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_movimiento`),
  KEY `idx_mov_animal_fecha` (`id_animal`,`empresa_id`,`fecha_hora`),
  KEY `idx_mov_finca_fecha` (`id_finca`,`empresa_id`,`fecha_hora`),
  KEY `idx_mov_lote_origen` (`lote_origen_id`,`empresa_id`),
  KEY `idx_mov_lote_dest` (`lote_destino_id`,`empresa_id`),
  KEY `idx_mov_pot_origen` (`potrero_origen_id`,`empresa_id`),
  KEY `idx_mov_pot_dest` (`potrero_destino_id`,`empresa_id`),
  KEY `idx_mov_motivo` (`id_motivo_movimiento`),
  KEY `idx_mov_created_by` (`created_by`),
  CONSTRAINT `fk_mov_animal` FOREIGN KEY (`id_animal`, `empresa_id`) REFERENCES `animales` (`id_animal`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_mov_created_by` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_mov_finca` FOREIGN KEY (`id_finca`, `empresa_id`) REFERENCES `fincas` (`id_finca`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_mov_lote_dest` FOREIGN KEY (`lote_destino_id`, `empresa_id`) REFERENCES `lotes` (`id_lote`, `empresa_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_mov_lote_origen` FOREIGN KEY (`lote_origen_id`, `empresa_id`) REFERENCES `lotes` (`id_lote`, `empresa_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_mov_motivo` FOREIGN KEY (`id_motivo_movimiento`) REFERENCES `motivos_movimiento` (`id_motivo_movimiento`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_mov_potrero_dest` FOREIGN KEY (`potrero_destino_id`, `empresa_id`) REFERENCES `potreros` (`id_potrero`, `empresa_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_mov_potrero_origen` FOREIGN KEY (`potrero_origen_id`, `empresa_id`) REFERENCES `potreros` (`id_potrero`, `empresa_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.movimientos_animales: ~0 rows (aproximadamente)

-- Volcando estructura para tabla ganadex.ocupacion_potreros
DROP TABLE IF EXISTS `ocupacion_potreros`;
CREATE TABLE IF NOT EXISTS `ocupacion_potreros` (
  `id_ocupacion` bigint unsigned NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint unsigned NOT NULL,
  `id_finca` bigint unsigned NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `id_lote` bigint unsigned NOT NULL,
  `id_potrero` bigint unsigned NOT NULL,
  `notas` text,
  PRIMARY KEY (`id_ocupacion`),
  KEY `idx_op_finca` (`id_finca`,`empresa_id`),
  KEY `idx_op_lote` (`id_lote`,`empresa_id`,`fecha_inicio`),
  KEY `idx_op_potrero` (`id_potrero`,`empresa_id`,`fecha_inicio`),
  CONSTRAINT `fk_op_finca` FOREIGN KEY (`id_finca`, `empresa_id`) REFERENCES `fincas` (`id_finca`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_op_lote` FOREIGN KEY (`id_lote`, `empresa_id`) REFERENCES `lotes` (`id_lote`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_op_potrero` FOREIGN KEY (`id_potrero`, `empresa_id`) REFERENCES `potreros` (`id_potrero`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_op_fechas` CHECK (((`fecha_fin` is null) or (`fecha_fin` >= `fecha_inicio`)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.ocupacion_potreros: ~0 rows (aproximadamente)

-- Volcando estructura para tabla ganadex.permisos
DROP TABLE IF EXISTS `permisos`;
CREATE TABLE IF NOT EXISTS `permisos` (
  `id_permiso` bigint unsigned NOT NULL AUTO_INCREMENT,
  `codigo` varchar(80) NOT NULL,
  `nombre` varchar(140) NOT NULL,
  `descripcion` text,
  PRIMARY KEY (`id_permiso`),
  UNIQUE KEY `uq_permisos_codigo` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.permisos: ~0 rows (aproximadamente)

-- Volcando estructura para tabla ganadex.planes
DROP TABLE IF EXISTS `planes`;
CREATE TABLE IF NOT EXISTS `planes` (
  `id_plan` bigint unsigned NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `descripcion` text,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_plan`),
  UNIQUE KEY `uq_planes_codigo` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.planes: ~0 rows (aproximadamente)

-- Volcando estructura para tabla ganadex.potreros
DROP TABLE IF EXISTS `potreros`;
CREATE TABLE IF NOT EXISTS `potreros` (
  `id_potrero` bigint unsigned NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint unsigned NOT NULL,
  `id_finca` bigint unsigned NOT NULL,
  `nombre` varchar(160) NOT NULL,
  `area_hectareas` decimal(12,2) DEFAULT NULL,
  `id_tipo_potrero` bigint unsigned DEFAULT NULL,
  `notas` text,
  PRIMARY KEY (`id_potrero`,`empresa_id`),
  UNIQUE KEY `uq_potreros_empresa_finca_nombre` (`empresa_id`,`id_finca`,`nombre`),
  KEY `idx_potreros_finca` (`id_finca`,`empresa_id`),
  KEY `idx_potreros_tipo` (`id_tipo_potrero`),
  CONSTRAINT `fk_potreros_finca` FOREIGN KEY (`id_finca`, `empresa_id`) REFERENCES `fincas` (`id_finca`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_potreros_tipo` FOREIGN KEY (`id_tipo_potrero`) REFERENCES `tipos_potrero` (`id_tipo_potrero`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.potreros: ~0 rows (aproximadamente)

-- Volcando estructura para tabla ganadex.produccion_leche
DROP TABLE IF EXISTS `produccion_leche`;
CREATE TABLE IF NOT EXISTS `produccion_leche` (
  `id_produccion` bigint unsigned NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint unsigned NOT NULL,
  `id_finca` bigint unsigned NOT NULL,
  `fecha` date NOT NULL,
  `id_turno` bigint unsigned DEFAULT NULL,
  `litros` decimal(12,3) NOT NULL,
  `notas` text,
  `created_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_produccion`),
  UNIQUE KEY `uq_pl_finca_fecha_turno` (`empresa_id`,`id_finca`,`fecha`,`id_turno`),
  KEY `idx_pl_finca_fecha` (`id_finca`,`empresa_id`,`fecha`),
  KEY `idx_pl_turno` (`id_turno`),
  KEY `idx_pl_created_by` (`created_by`),
  CONSTRAINT `fk_pl_created_by` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pl_finca` FOREIGN KEY (`id_finca`, `empresa_id`) REFERENCES `fincas` (`id_finca`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_pl_turno` FOREIGN KEY (`id_turno`) REFERENCES `turnos_ordenio` (`id_turno`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.produccion_leche: ~0 rows (aproximadamente)

-- Volcando estructura para tabla ganadex.protocolo_ejecucion_tareas
DROP TABLE IF EXISTS `protocolo_ejecucion_tareas`;
CREATE TABLE IF NOT EXISTS `protocolo_ejecucion_tareas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_ejecucion` bigint unsigned NOT NULL,
  `id_tarea` bigint unsigned NOT NULL,
  `completada` tinyint(1) NOT NULL DEFAULT '0',
  `fecha` date DEFAULT NULL,
  `responsable` varchar(160) DEFAULT NULL,
  `notas` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_pet_ejecucion_tarea` (`id_ejecucion`,`id_tarea`),
  KEY `idx_pet_tarea` (`id_tarea`),
  CONSTRAINT `fk_pet_ejecucion` FOREIGN KEY (`id_ejecucion`) REFERENCES `protocolo_ejecuciones` (`id_ejecucion`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_pet_tarea` FOREIGN KEY (`id_tarea`) REFERENCES `protocolo_tareas` (`id_tarea`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.protocolo_ejecucion_tareas: ~0 rows (aproximadamente)

-- Volcando estructura para tabla ganadex.protocolo_ejecuciones
DROP TABLE IF EXISTS `protocolo_ejecuciones`;
CREATE TABLE IF NOT EXISTS `protocolo_ejecuciones` (
  `id_ejecucion` bigint unsigned NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint unsigned NOT NULL,
  `id_protocolo` bigint unsigned NOT NULL,
  `id_animal` bigint unsigned NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_cierre` date DEFAULT NULL,
  `observaciones` text,
  `created_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_ejecucion`),
  KEY `idx_pe_animal` (`id_animal`,`empresa_id`,`fecha_inicio`),
  KEY `idx_pe_protocolo` (`id_protocolo`),
  KEY `idx_pe_created_by` (`created_by`),
  CONSTRAINT `fk_pe_animal` FOREIGN KEY (`id_animal`, `empresa_id`) REFERENCES `animales` (`id_animal`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_pe_created_by` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pe_protocolo` FOREIGN KEY (`id_protocolo`) REFERENCES `protocolos` (`id_protocolo`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_pe_fechas` CHECK (((`fecha_cierre` is null) or (`fecha_cierre` >= `fecha_inicio`)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.protocolo_ejecuciones: ~0 rows (aproximadamente)

-- Volcando estructura para tabla ganadex.protocolo_tareas
DROP TABLE IF EXISTS `protocolo_tareas`;
CREATE TABLE IF NOT EXISTS `protocolo_tareas` (
  `id_tarea` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_protocolo` bigint unsigned NOT NULL,
  `nombre` varchar(160) NOT NULL,
  `dia_objetivo` int NOT NULL,
  `obligatorio` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_tarea`),
  KEY `idx_pt_protocolo` (`id_protocolo`),
  CONSTRAINT `fk_pt_protocolo` FOREIGN KEY (`id_protocolo`) REFERENCES `protocolos` (`id_protocolo`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.protocolo_tareas: ~0 rows (aproximadamente)

-- Volcando estructura para tabla ganadex.protocolos
DROP TABLE IF EXISTS `protocolos`;
CREATE TABLE IF NOT EXISTS `protocolos` (
  `id_protocolo` bigint unsigned NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint unsigned DEFAULT NULL,
  `empresa_id_u` bigint unsigned GENERATED ALWAYS AS (ifnull(`empresa_id`,0)) STORED,
  `codigo` varchar(60) NOT NULL,
  `nombre` varchar(160) NOT NULL,
  `descripcion` text,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_protocolo`),
  UNIQUE KEY `uq_pr_empresa_codigo` (`empresa_id_u`,`codigo`),
  KEY `idx_pr_empresa` (`empresa_id`),
  CONSTRAINT `fk_pr_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id_empresa`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.protocolos: ~0 rows (aproximadamente)

-- Volcando estructura para tabla ganadex.razas
DROP TABLE IF EXISTS `razas`;
CREATE TABLE IF NOT EXISTS `razas` (
  `id_raza` bigint unsigned NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint unsigned DEFAULT NULL,
  `empresa_id_u` bigint unsigned GENERATED ALWAYS AS (ifnull(`empresa_id`,0)) STORED,
  `codigo` varchar(60) NOT NULL,
  `nombre` varchar(140) NOT NULL,
  PRIMARY KEY (`id_raza`),
  UNIQUE KEY `uq_razas_empresa_codigo` (`empresa_id_u`,`codigo`),
  KEY `idx_razas_empresa` (`empresa_id`),
  CONSTRAINT `fk_razas_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id_empresa`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.razas: ~0 rows (aproximadamente)

-- Volcando estructura para tabla ganadex.recordatorios
DROP TABLE IF EXISTS `recordatorios`;
CREATE TABLE IF NOT EXISTS `recordatorios` (
  `id_recordatorio` bigint unsigned NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint unsigned NOT NULL,
  `id_tipo_recordatorio` bigint unsigned NOT NULL,
  `id_animal` bigint unsigned DEFAULT NULL,
  `fecha_programada` date NOT NULL,
  `descripcion` varchar(200) DEFAULT NULL,
  `estado_codigo` varchar(30) NOT NULL DEFAULT 'pendiente',
  `id_tratamiento` bigint unsigned DEFAULT NULL,
  `id_retiro` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_recordatorio`),
  KEY `idx_rec_empresa_fecha` (`empresa_id`,`fecha_programada`),
  KEY `idx_rec_animal` (`id_animal`,`empresa_id`),
  KEY `idx_rec_tipo` (`id_tipo_recordatorio`),
  KEY `idx_rec_estado` (`estado_codigo`),
  KEY `fk_rec_tratamiento` (`id_tratamiento`),
  KEY `fk_rec_retiro` (`id_retiro`),
  CONSTRAINT `fk_rec_animal` FOREIGN KEY (`id_animal`, `empresa_id`) REFERENCES `animales` (`id_animal`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_rec_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id_empresa`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_rec_estado` FOREIGN KEY (`estado_codigo`) REFERENCES `estados_recordatorio` (`codigo`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_rec_retiro` FOREIGN KEY (`id_retiro`) REFERENCES `retiros` (`id_retiro`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_rec_tipo` FOREIGN KEY (`id_tipo_recordatorio`) REFERENCES `tipos_recordatorio` (`id_tipo_recordatorio`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_rec_tratamiento` FOREIGN KEY (`id_tratamiento`) REFERENCES `tratamientos` (`id_tratamiento`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.recordatorios: ~0 rows (aproximadamente)

-- Volcando estructura para tabla ganadex.resultados_palpacion
DROP TABLE IF EXISTS `resultados_palpacion`;
CREATE TABLE IF NOT EXISTS `resultados_palpacion` (
  `id_resultado_palpacion` bigint unsigned NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint unsigned DEFAULT NULL,
  `empresa_id_u` bigint unsigned GENERATED ALWAYS AS (ifnull(`empresa_id`,0)) STORED,
  `codigo` varchar(40) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  PRIMARY KEY (`id_resultado_palpacion`),
  UNIQUE KEY `uq_rp_empresa_codigo` (`empresa_id_u`,`codigo`),
  KEY `idx_rp_empresa` (`empresa_id`),
  CONSTRAINT `fk_rp_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id_empresa`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.resultados_palpacion: ~3 rows (aproximadamente)
INSERT INTO `resultados_palpacion` (`id_resultado_palpacion`, `empresa_id`, `codigo`, `nombre`) VALUES
	(1, NULL, 'prenada', 'Preñada'),
	(2, NULL, 'vacia', 'Vacía'),
	(3, NULL, 'dudosa', 'Dudosa');

-- Volcando estructura para tabla ganadex.retiros
DROP TABLE IF EXISTS `retiros`;
CREATE TABLE IF NOT EXISTS `retiros` (
  `id_retiro` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_tratamiento` bigint unsigned NOT NULL,
  `id_tipo_retiro` bigint unsigned NOT NULL,
  `dias_retiro` int NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_retiro`),
  KEY `idx_ret_tratamiento` (`id_tratamiento`),
  KEY `idx_ret_tipo` (`id_tipo_retiro`),
  KEY `idx_ret_fechas` (`fecha_inicio`,`fecha_fin`),
  CONSTRAINT `fk_ret_tipo` FOREIGN KEY (`id_tipo_retiro`) REFERENCES `tipos_retiro` (`id_tipo_retiro`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_ret_tratamiento` FOREIGN KEY (`id_tratamiento`) REFERENCES `tratamientos` (`id_tratamiento`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_ret_fechas` CHECK ((`fecha_fin` >= `fecha_inicio`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.retiros: ~0 rows (aproximadamente)

-- Volcando estructura para tabla ganadex.roles
DROP TABLE IF EXISTS `roles`;
CREATE TABLE IF NOT EXISTS `roles` (
  `id_rol` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_ambito_rol` bigint unsigned NOT NULL,
  `codigo` varchar(50) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `descripcion` text,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `uq_roles_codigo` (`codigo`),
  KEY `idx_roles_ambito` (`id_ambito_rol`),
  CONSTRAINT `fk_roles_ambito` FOREIGN KEY (`id_ambito_rol`) REFERENCES `ambitos_rol` (`id_ambito_rol`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.roles: ~2 rows (aproximadamente)
INSERT INTO `roles` (`id_rol`, `id_ambito_rol`, `codigo`, `nombre`, `descripcion`, `activo`) VALUES
	(1, 1, 'admin_empresa', 'Administrador (Empresa)', 'Acceso total a nivel empresa', 1),
	(2, 2, 'admin_finca', 'Administrador (Finca)', 'Acceso total a nivel finca', 1);

-- Volcando estructura para tabla ganadex.roles_permisos
DROP TABLE IF EXISTS `roles_permisos`;
CREATE TABLE IF NOT EXISTS `roles_permisos` (
  `id_rol` bigint unsigned NOT NULL,
  `id_permiso` bigint unsigned NOT NULL,
  PRIMARY KEY (`id_rol`,`id_permiso`),
  KEY `idx_rp_permiso` (`id_permiso`),
  CONSTRAINT `fk_rp_permiso` FOREIGN KEY (`id_permiso`) REFERENCES `permisos` (`id_permiso`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_rp_rol` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.roles_permisos: ~0 rows (aproximadamente)

-- Volcando estructura para tabla ganadex.tasas_cambio
DROP TABLE IF EXISTS `tasas_cambio`;
CREATE TABLE IF NOT EXISTS `tasas_cambio` (
  `id_tasa` bigint unsigned NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint unsigned DEFAULT NULL,
  `empresa_id_u` bigint unsigned GENERATED ALWAYS AS (ifnull(`empresa_id`,0)) STORED,
  `fecha` date NOT NULL,
  `moneda_origen_id` bigint unsigned NOT NULL,
  `moneda_destino_id` bigint unsigned NOT NULL,
  `tasa` decimal(18,8) NOT NULL,
  `fuente` varchar(120) DEFAULT NULL,
  PRIMARY KEY (`id_tasa`),
  UNIQUE KEY `uq_tc_fecha_par_empresa` (`empresa_id_u`,`fecha`,`moneda_origen_id`,`moneda_destino_id`),
  KEY `idx_tc_empresa` (`empresa_id`),
  KEY `idx_tc_origen` (`moneda_origen_id`),
  KEY `idx_tc_dest` (`moneda_destino_id`),
  CONSTRAINT `fk_tc_destino` FOREIGN KEY (`moneda_destino_id`) REFERENCES `monedas` (`id_moneda`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_tc_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id_empresa`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_tc_origen` FOREIGN KEY (`moneda_origen_id`) REFERENCES `monedas` (`id_moneda`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.tasas_cambio: ~0 rows (aproximadamente)

-- Volcando estructura para tabla ganadex.tipos_adjunto
DROP TABLE IF EXISTS `tipos_adjunto`;
CREATE TABLE IF NOT EXISTS `tipos_adjunto` (
  `id_tipo_adjunto` bigint unsigned NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint unsigned DEFAULT NULL,
  `empresa_id_u` bigint unsigned GENERATED ALWAYS AS (ifnull(`empresa_id`,0)) STORED,
  `codigo` varchar(60) NOT NULL,
  `nombre` varchar(140) NOT NULL,
  PRIMARY KEY (`id_tipo_adjunto`),
  UNIQUE KEY `uq_ta_empresa_codigo` (`empresa_id_u`,`codigo`),
  KEY `idx_ta_empresa` (`empresa_id`),
  CONSTRAINT `fk_ta_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id_empresa`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.tipos_adjunto: ~4 rows (aproximadamente)
INSERT INTO `tipos_adjunto` (`id_tipo_adjunto`, `empresa_id`, `codigo`, `nombre`) VALUES
	(1, NULL, 'foto_factura', 'Foto de factura'),
	(2, NULL, 'pdf', 'PDF'),
	(3, NULL, 'imagen', 'Imagen'),
	(4, NULL, 'otro', 'Otro');

-- Volcando estructura para tabla ganadex.tipos_evento_reproductivo
DROP TABLE IF EXISTS `tipos_evento_reproductivo`;
CREATE TABLE IF NOT EXISTS `tipos_evento_reproductivo` (
  `id_tipo_evento_reproductivo` bigint unsigned NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint unsigned DEFAULT NULL,
  `empresa_id_u` bigint unsigned GENERATED ALWAYS AS (ifnull(`empresa_id`,0)) STORED,
  `codigo` varchar(40) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  PRIMARY KEY (`id_tipo_evento_reproductivo`),
  UNIQUE KEY `uq_ter_empresa_codigo` (`empresa_id_u`,`codigo`),
  KEY `idx_ter_empresa` (`empresa_id`),
  CONSTRAINT `fk_ter_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id_empresa`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.tipos_evento_reproductivo: ~5 rows (aproximadamente)
INSERT INTO `tipos_evento_reproductivo` (`id_tipo_evento_reproductivo`, `empresa_id`, `codigo`, `nombre`) VALUES
	(1, NULL, 'celo', 'Celo'),
	(2, NULL, 'servicio', 'Servicio / Monta / Inseminación'),
	(3, NULL, 'palpacion', 'Palpación'),
	(4, NULL, 'parto', 'Parto'),
	(5, NULL, 'aborto', 'Aborto');

-- Volcando estructura para tabla ganadex.tipos_identificacion
DROP TABLE IF EXISTS `tipos_identificacion`;
CREATE TABLE IF NOT EXISTS `tipos_identificacion` (
  `id_tipo_identificacion` bigint unsigned NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint unsigned DEFAULT NULL,
  `empresa_id_u` bigint unsigned GENERATED ALWAYS AS (ifnull(`empresa_id`,0)) STORED,
  `codigo` varchar(40) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  PRIMARY KEY (`id_tipo_identificacion`),
  UNIQUE KEY `uq_ti_empresa_codigo` (`empresa_id_u`,`codigo`),
  KEY `idx_ti_empresa` (`empresa_id`),
  CONSTRAINT `fk_ti_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id_empresa`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.tipos_identificacion: ~4 rows (aproximadamente)
INSERT INTO `tipos_identificacion` (`id_tipo_identificacion`, `empresa_id`, `codigo`, `nombre`) VALUES
	(1, NULL, 'hierro_lomo', 'Hierro / marca'),
	(2, NULL, 'arete', 'Arete'),
	(3, NULL, 'tatuaje_oreja', 'Tatuaje en oreja'),
	(4, NULL, 'microchip', 'Microchip');

-- Volcando estructura para tabla ganadex.tipos_potrero
DROP TABLE IF EXISTS `tipos_potrero`;
CREATE TABLE IF NOT EXISTS `tipos_potrero` (
  `id_tipo_potrero` bigint unsigned NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint unsigned DEFAULT NULL,
  `empresa_id_u` bigint unsigned GENERATED ALWAYS AS (ifnull(`empresa_id`,0)) STORED,
  `codigo` varchar(60) NOT NULL,
  `nombre` varchar(140) NOT NULL,
  PRIMARY KEY (`id_tipo_potrero`),
  UNIQUE KEY `uq_tp_empresa_codigo` (`empresa_id_u`,`codigo`),
  KEY `idx_tp_empresa` (`empresa_id`),
  CONSTRAINT `fk_tp_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id_empresa`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.tipos_potrero: ~0 rows (aproximadamente)

-- Volcando estructura para tabla ganadex.tipos_recordatorio
DROP TABLE IF EXISTS `tipos_recordatorio`;
CREATE TABLE IF NOT EXISTS `tipos_recordatorio` (
  `id_tipo_recordatorio` bigint unsigned NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint unsigned DEFAULT NULL,
  `empresa_id_u` bigint unsigned GENERATED ALWAYS AS (ifnull(`empresa_id`,0)) STORED,
  `codigo` varchar(80) NOT NULL,
  `nombre` varchar(160) NOT NULL,
  PRIMARY KEY (`id_tipo_recordatorio`),
  UNIQUE KEY `uq_trc_empresa_codigo` (`empresa_id_u`,`codigo`),
  KEY `idx_trc_empresa` (`empresa_id`),
  CONSTRAINT `fk_trc_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id_empresa`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.tipos_recordatorio: ~6 rows (aproximadamente)
INSERT INTO `tipos_recordatorio` (`id_tipo_recordatorio`, `empresa_id`, `codigo`, `nombre`) VALUES
	(1, NULL, 'retiro_leche', 'Retiro de leche'),
	(2, NULL, 'retiro_carne', 'Retiro de carne'),
	(3, NULL, 'vacuna', 'Vacunación'),
	(4, NULL, 'palpacion', 'Palpación / chequeo'),
	(5, NULL, 'destete', 'Destete'),
	(6, NULL, 'otro', 'Otro');

-- Volcando estructura para tabla ganadex.tipos_retiro
DROP TABLE IF EXISTS `tipos_retiro`;
CREATE TABLE IF NOT EXISTS `tipos_retiro` (
  `id_tipo_retiro` bigint unsigned NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint unsigned DEFAULT NULL,
  `empresa_id_u` bigint unsigned GENERATED ALWAYS AS (ifnull(`empresa_id`,0)) STORED,
  `codigo` varchar(40) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  PRIMARY KEY (`id_tipo_retiro`),
  UNIQUE KEY `uq_tr_empresa_codigo` (`empresa_id_u`,`codigo`),
  KEY `idx_tr_empresa` (`empresa_id`),
  CONSTRAINT `fk_tr_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id_empresa`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.tipos_retiro: ~0 rows (aproximadamente)

-- Volcando estructura para tabla ganadex.tipos_transaccion
DROP TABLE IF EXISTS `tipos_transaccion`;
CREATE TABLE IF NOT EXISTS `tipos_transaccion` (
  `id_tipo_transaccion` bigint unsigned NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint unsigned DEFAULT NULL,
  `empresa_id_u` bigint unsigned GENERATED ALWAYS AS (ifnull(`empresa_id`,0)) STORED,
  `codigo` varchar(30) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  PRIMARY KEY (`id_tipo_transaccion`),
  UNIQUE KEY `uq_tt_empresa_codigo` (`empresa_id_u`,`codigo`),
  KEY `idx_tt_empresa` (`empresa_id`),
  CONSTRAINT `fk_tt_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id_empresa`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.tipos_transaccion: ~2 rows (aproximadamente)
INSERT INTO `tipos_transaccion` (`id_tipo_transaccion`, `empresa_id`, `codigo`, `nombre`) VALUES
	(1, NULL, 'ingreso', 'Ingreso'),
	(2, NULL, 'gasto', 'Gasto');

-- Volcando estructura para tabla ganadex.transacciones_financieras
DROP TABLE IF EXISTS `transacciones_financieras`;
CREATE TABLE IF NOT EXISTS `transacciones_financieras` (
  `id_transaccion` bigint unsigned NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint unsigned NOT NULL,
  `fecha` date NOT NULL,
  `id_tipo_transaccion` bigint unsigned NOT NULL,
  `id_categoria_financiera` bigint unsigned NOT NULL,
  `monto` decimal(18,2) NOT NULL,
  `descripcion` text,
  `id_tercero` bigint unsigned DEFAULT NULL,
  `created_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_transaccion`),
  KEY `idx_tf_empresa_fecha` (`empresa_id`,`fecha`),
  KEY `idx_tf_tipo` (`id_tipo_transaccion`),
  KEY `idx_tf_cat` (`id_categoria_financiera`),
  KEY `fk_tf_created_by` (`created_by`),
  CONSTRAINT `fk_tf_categoria` FOREIGN KEY (`id_categoria_financiera`) REFERENCES `categorias_financieras` (`id_categoria_financiera`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_tf_created_by` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_tf_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id_empresa`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_tf_tipo` FOREIGN KEY (`id_tipo_transaccion`) REFERENCES `tipos_transaccion` (`id_tipo_transaccion`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.transacciones_financieras: ~0 rows (aproximadamente)

-- Volcando estructura para tabla ganadex.tratamientos
DROP TABLE IF EXISTS `tratamientos`;
CREATE TABLE IF NOT EXISTS `tratamientos` (
  `id_tratamiento` bigint unsigned NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint unsigned NOT NULL,
  `id_evento_sanitario` bigint unsigned DEFAULT NULL,
  `id_animal` bigint unsigned NOT NULL,
  `fecha_inicio` date NOT NULL,
  `id_medicamento` bigint unsigned NOT NULL,
  `dosis` varchar(120) DEFAULT NULL,
  `via_administracion` varchar(120) DEFAULT NULL,
  `notas` text,
  `created_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_tratamiento`),
  KEY `idx_tr_animal_fecha` (`id_animal`,`empresa_id`,`fecha_inicio`),
  KEY `idx_tr_evento` (`id_evento_sanitario`),
  KEY `idx_tr_medicamento` (`id_medicamento`),
  KEY `idx_tr_created_by` (`created_by`),
  CONSTRAINT `fk_tr_animal` FOREIGN KEY (`id_animal`, `empresa_id`) REFERENCES `animales` (`id_animal`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_tr_created_by` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_tr_evento` FOREIGN KEY (`id_evento_sanitario`) REFERENCES `eventos_sanitarios` (`id_evento_sanitario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_tr_medicamento` FOREIGN KEY (`id_medicamento`) REFERENCES `medicamentos` (`id_medicamento`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.tratamientos: ~0 rows (aproximadamente)

-- Volcando estructura para tabla ganadex.turnos_ordenio
DROP TABLE IF EXISTS `turnos_ordenio`;
CREATE TABLE IF NOT EXISTS `turnos_ordenio` (
  `id_turno` bigint unsigned NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint unsigned DEFAULT NULL,
  `empresa_id_u` bigint unsigned GENERATED ALWAYS AS (ifnull(`empresa_id`,0)) STORED,
  `codigo` varchar(40) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  PRIMARY KEY (`id_turno`),
  UNIQUE KEY `uq_to_empresa_codigo` (`empresa_id_u`,`codigo`),
  KEY `idx_to_empresa` (`empresa_id`),
  CONSTRAINT `fk_to_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id_empresa`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.turnos_ordenio: ~2 rows (aproximadamente)
INSERT INTO `turnos_ordenio` (`id_turno`, `empresa_id`, `codigo`, `nombre`) VALUES
	(1, NULL, 'manana', 'Mañana'),
	(2, NULL, 'tarde', 'Tarde');

-- Volcando estructura para tabla ganadex.usuario_empresas
DROP TABLE IF EXISTS `usuario_empresas`;
CREATE TABLE IF NOT EXISTS `usuario_empresas` (
  `id_usuario` bigint unsigned NOT NULL,
  `id_empresa` bigint unsigned NOT NULL,
  `id_rol` bigint unsigned NOT NULL,
  `estado` varchar(20) NOT NULL DEFAULT 'activo',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`,`id_empresa`),
  KEY `idx_ue_empresa` (`id_empresa`),
  KEY `idx_ue_rol` (`id_rol`),
  CONSTRAINT `fk_ue_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresas` (`id_empresa`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ue_rol` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_ue_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.usuario_empresas: ~0 rows (aproximadamente)

-- Volcando estructura para tabla ganadex.usuario_fincas
DROP TABLE IF EXISTS `usuario_fincas`;
CREATE TABLE IF NOT EXISTS `usuario_fincas` (
  `id_usuario` bigint unsigned NOT NULL,
  `id_finca` bigint unsigned NOT NULL,
  `empresa_id` bigint unsigned NOT NULL,
  `id_rol` bigint unsigned NOT NULL,
  `desde` date DEFAULT NULL,
  `hasta` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`,`id_finca`,`empresa_id`),
  KEY `idx_uf_finca` (`id_finca`,`empresa_id`),
  KEY `idx_uf_rol` (`id_rol`),
  CONSTRAINT `fk_uf_finca` FOREIGN KEY (`id_finca`, `empresa_id`) REFERENCES `fincas` (`id_finca`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_uf_rol` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_uf_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.usuario_fincas: ~0 rows (aproximadamente)

-- Volcando estructura para tabla ganadex.usuarios
DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id_usuario` bigint unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(254) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `telefono` varchar(40) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `uq_usuarios_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.usuarios: ~0 rows (aproximadamente)

-- Volcando estructura para tabla ganadex.vacunaciones
DROP TABLE IF EXISTS `vacunaciones`;
CREATE TABLE IF NOT EXISTS `vacunaciones` (
  `id_vacunacion` bigint unsigned NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint unsigned NOT NULL,
  `fecha` date NOT NULL,
  `id_vacuna` bigint unsigned NOT NULL,
  `id_animal` bigint unsigned NOT NULL,
  `lote_vacuna` varchar(60) DEFAULT NULL,
  `costo` decimal(18,2) DEFAULT NULL,
  `observaciones` text,
  `created_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_vacunacion`),
  KEY `idx_vacn_empresa_fecha` (`empresa_id`,`fecha`),
  KEY `idx_vacn_animal` (`id_animal`,`empresa_id`),
  KEY `idx_vacn_vacuna` (`id_vacuna`),
  KEY `fk_vacn_created_by` (`created_by`),
  CONSTRAINT `fk_vacn_animal` FOREIGN KEY (`id_animal`, `empresa_id`) REFERENCES `animales` (`id_animal`, `empresa_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_vacn_created_by` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_vacn_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id_empresa`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_vacn_vacuna` FOREIGN KEY (`id_vacuna`) REFERENCES `vacunas` (`id_vacuna`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.vacunaciones: ~0 rows (aproximadamente)

-- Volcando estructura para tabla ganadex.vacunas
DROP TABLE IF EXISTS `vacunas`;
CREATE TABLE IF NOT EXISTS `vacunas` (
  `id_vacuna` bigint unsigned NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint unsigned DEFAULT NULL,
  `empresa_id_u` bigint unsigned GENERATED ALWAYS AS (ifnull(`empresa_id`,0)) STORED,
  `codigo` varchar(80) NOT NULL,
  `nombre` varchar(160) NOT NULL,
  `descripcion` text,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_vacuna`),
  UNIQUE KEY `uq_vac_empresa_codigo` (`empresa_id_u`,`codigo`),
  KEY `idx_vac_empresa` (`empresa_id`),
  CONSTRAINT `fk_vac_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id_empresa`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla ganadex.vacunas: ~0 rows (aproximadamente)

-- Volcando estructura para disparador ganadex.trg_ac_validar_categoria_bi
DROP TRIGGER IF EXISTS `trg_ac_validar_categoria_bi`;
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='';
DELIMITER //
CREATE TRIGGER `trg_ac_validar_categoria_bi` BEFORE INSERT ON `animal_categorias_historial` FOR EACH ROW BEGIN
  DECLARE v_emp BIGINT UNSIGNED;
  SELECT empresa_id INTO v_emp
  FROM categorias_animales
  WHERE id_categoria_animal = NEW.id_categoria_animal;

  IF v_emp IS NOT NULL AND v_emp <> NEW.empresa_id THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'La categoria_animal no pertenece a la empresa (ni es global)';
  END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador ganadex.trg_ac_validar_categoria_bu
DROP TRIGGER IF EXISTS `trg_ac_validar_categoria_bu`;
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='';
DELIMITER //
CREATE TRIGGER `trg_ac_validar_categoria_bu` BEFORE UPDATE ON `animal_categorias_historial` FOR EACH ROW BEGIN
  DECLARE v_emp BIGINT UNSIGNED;
  SELECT empresa_id INTO v_emp
  FROM categorias_animales
  WHERE id_categoria_animal = NEW.id_categoria_animal;

  IF v_emp IS NOT NULL AND v_emp <> NEW.empresa_id THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'La categoria_animal no pertenece a la empresa (ni es global)';
  END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador ganadex.trg_ad_validar_tipoid_bi
DROP TRIGGER IF EXISTS `trg_ad_validar_tipoid_bi`;
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='';
DELIMITER //
CREATE TRIGGER `trg_ad_validar_tipoid_bi` BEFORE INSERT ON `auditoria_detalle` FOR EACH ROW BEGIN
  DECLARE v_emp_aud BIGINT UNSIGNED;
  DECLARE v_emp_tipo BIGINT UNSIGNED;

  SELECT empresa_id INTO v_emp_aud
  FROM auditorias_inventario
  WHERE id_auditoria = NEW.id_auditoria;

  IF NEW.id_tipo_identificacion IS NOT NULL THEN
    SELECT empresa_id INTO v_emp_tipo
    FROM tipos_identificacion
    WHERE id_tipo_identificacion = NEW.id_tipo_identificacion;

    IF v_emp_aud IS NULL THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Auditoria no encontrada para validar tipo_identificacion';
    END IF;

    IF v_emp_tipo IS NOT NULL AND v_emp_tipo <> v_emp_aud THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El tipo_identificacion no pertenece a la empresa de la auditoria (ni es global)';
    END IF;
  END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador ganadex.trg_ad_validar_tipoid_bu
DROP TRIGGER IF EXISTS `trg_ad_validar_tipoid_bu`;
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='';
DELIMITER //
CREATE TRIGGER `trg_ad_validar_tipoid_bu` BEFORE UPDATE ON `auditoria_detalle` FOR EACH ROW BEGIN
  DECLARE v_emp_aud BIGINT UNSIGNED;
  DECLARE v_emp_tipo BIGINT UNSIGNED;

  SELECT empresa_id INTO v_emp_aud
  FROM auditorias_inventario
  WHERE id_auditoria = NEW.id_auditoria;

  IF NEW.id_tipo_identificacion IS NOT NULL THEN
    SELECT empresa_id INTO v_emp_tipo
    FROM tipos_identificacion
    WHERE id_tipo_identificacion = NEW.id_tipo_identificacion;

    IF v_emp_aud IS NULL THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Auditoria no encontrada para validar tipo_identificacion';
    END IF;

    IF v_emp_tipo IS NOT NULL AND v_emp_tipo <> v_emp_aud THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El tipo_identificacion no pertenece a la empresa de la auditoria (ni es global)';
    END IF;
  END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador ganadex.trg_ae_validar_estado_bi
DROP TRIGGER IF EXISTS `trg_ae_validar_estado_bi`;
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='';
DELIMITER //
CREATE TRIGGER `trg_ae_validar_estado_bi` BEFORE INSERT ON `animal_estados_historial` FOR EACH ROW BEGIN
  DECLARE v_emp BIGINT UNSIGNED;
  SELECT empresa_id INTO v_emp
  FROM estados_animales
  WHERE id_estado_animal = NEW.id_estado_animal;

  IF v_emp IS NOT NULL AND v_emp <> NEW.empresa_id THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'El estado_animal no pertenece a la empresa (ni es global)';
  END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador ganadex.trg_ae_validar_estado_bu
DROP TRIGGER IF EXISTS `trg_ae_validar_estado_bu`;
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='';
DELIMITER //
CREATE TRIGGER `trg_ae_validar_estado_bu` BEFORE UPDATE ON `animal_estados_historial` FOR EACH ROW BEGIN
  DECLARE v_emp BIGINT UNSIGNED;
  SELECT empresa_id INTO v_emp
  FROM estados_animales
  WHERE id_estado_animal = NEW.id_estado_animal;

  IF v_emp IS NOT NULL AND v_emp <> NEW.empresa_id THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'El estado_animal no pertenece a la empresa (ni es global)';
  END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador ganadex.trg_ai_validar_tipoid_bi
DROP TRIGGER IF EXISTS `trg_ai_validar_tipoid_bi`;
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='';
DELIMITER //
CREATE TRIGGER `trg_ai_validar_tipoid_bi` BEFORE INSERT ON `animal_identificaciones` FOR EACH ROW BEGIN
  DECLARE v_emp BIGINT UNSIGNED;
  SELECT empresa_id INTO v_emp
  FROM tipos_identificacion
  WHERE id_tipo_identificacion = NEW.id_tipo_identificacion;

  IF v_emp IS NOT NULL AND v_emp <> NEW.empresa_id THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'El tipo_identificacion no pertenece a la empresa (ni es global)';
  END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador ganadex.trg_ai_validar_tipoid_bu
DROP TRIGGER IF EXISTS `trg_ai_validar_tipoid_bu`;
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='';
DELIMITER //
CREATE TRIGGER `trg_ai_validar_tipoid_bu` BEFORE UPDATE ON `animal_identificaciones` FOR EACH ROW BEGIN
  DECLARE v_emp BIGINT UNSIGNED;
  SELECT empresa_id INTO v_emp
  FROM tipos_identificacion
  WHERE id_tipo_identificacion = NEW.id_tipo_identificacion;

  IF v_emp IS NOT NULL AND v_emp <> NEW.empresa_id THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'El tipo_identificacion no pertenece a la empresa (ni es global)';
  END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador ganadex.trg_at_validar_tipoadjunto_bi
DROP TRIGGER IF EXISTS `trg_at_validar_tipoadjunto_bi`;
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='';
DELIMITER //
CREATE TRIGGER `trg_at_validar_tipoadjunto_bi` BEFORE INSERT ON `adjuntos_transaccion` FOR EACH ROW BEGIN
  DECLARE v_emp_tx BIGINT UNSIGNED;
  DECLARE v_emp_ta BIGINT UNSIGNED;

  SELECT empresa_id INTO v_emp_tx
  FROM transacciones_financieras
  WHERE id_transaccion = NEW.id_transaccion;

  IF NEW.id_tipo_adjunto IS NOT NULL THEN
    SELECT empresa_id INTO v_emp_ta
    FROM tipos_adjunto
    WHERE id_tipo_adjunto = NEW.id_tipo_adjunto;

    IF v_emp_tx IS NULL THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Transaccion no encontrada para validar tipo_adjunto';
    END IF;

    IF v_emp_ta IS NOT NULL AND v_emp_ta <> v_emp_tx THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El tipo_adjunto no pertenece a la empresa de la transaccion (ni es global)';
    END IF;
  END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador ganadex.trg_at_validar_tipoadjunto_bu
DROP TRIGGER IF EXISTS `trg_at_validar_tipoadjunto_bu`;
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='';
DELIMITER //
CREATE TRIGGER `trg_at_validar_tipoadjunto_bu` BEFORE UPDATE ON `adjuntos_transaccion` FOR EACH ROW BEGIN
  DECLARE v_emp_tx BIGINT UNSIGNED;
  DECLARE v_emp_ta BIGINT UNSIGNED;

  SELECT empresa_id INTO v_emp_tx
  FROM transacciones_financieras
  WHERE id_transaccion = NEW.id_transaccion;

  IF NEW.id_tipo_adjunto IS NOT NULL THEN
    SELECT empresa_id INTO v_emp_ta
    FROM tipos_adjunto
    WHERE id_tipo_adjunto = NEW.id_tipo_adjunto;

    IF v_emp_tx IS NULL THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Transaccion no encontrada para validar tipo_adjunto';
    END IF;

    IF v_emp_ta IS NOT NULL AND v_emp_ta <> v_emp_tx THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El tipo_adjunto no pertenece a la empresa de la transaccion (ni es global)';
    END IF;
  END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador ganadex.trg_er_validar_catalogos_bi
DROP TRIGGER IF EXISTS `trg_er_validar_catalogos_bi`;
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='';
DELIMITER //
CREATE TRIGGER `trg_er_validar_catalogos_bi` BEFORE INSERT ON `eventos_reproductivos` FOR EACH ROW BEGIN
  DECLARE v_emp_tipo BIGINT UNSIGNED;
  DECLARE v_emp_res BIGINT UNSIGNED;

  SELECT empresa_id INTO v_emp_tipo
  FROM tipos_evento_reproductivo
  WHERE id_tipo_evento_reproductivo = NEW.id_tipo_evento_reproductivo;

  IF v_emp_tipo IS NOT NULL AND v_emp_tipo <> NEW.empresa_id THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'El tipo_evento_reproductivo no pertenece a la empresa (ni es global)';
  END IF;

  IF NEW.id_resultado_palpacion IS NOT NULL THEN
    SELECT empresa_id INTO v_emp_res
    FROM resultados_palpacion
    WHERE id_resultado_palpacion = NEW.id_resultado_palpacion;

    IF v_emp_res IS NOT NULL AND v_emp_res <> NEW.empresa_id THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El resultado_palpacion no pertenece a la empresa (ni es global)';
    END IF;
  END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador ganadex.trg_er_validar_catalogos_bu
DROP TRIGGER IF EXISTS `trg_er_validar_catalogos_bu`;
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='';
DELIMITER //
CREATE TRIGGER `trg_er_validar_catalogos_bu` BEFORE UPDATE ON `eventos_reproductivos` FOR EACH ROW BEGIN
  DECLARE v_emp_tipo BIGINT UNSIGNED;
  DECLARE v_emp_res BIGINT UNSIGNED;

  SELECT empresa_id INTO v_emp_tipo
  FROM tipos_evento_reproductivo
  WHERE id_tipo_evento_reproductivo = NEW.id_tipo_evento_reproductivo;

  IF v_emp_tipo IS NOT NULL AND v_emp_tipo <> NEW.empresa_id THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'El tipo_evento_reproductivo no pertenece a la empresa (ni es global)';
  END IF;

  IF NEW.id_resultado_palpacion IS NOT NULL THEN
    SELECT empresa_id INTO v_emp_res
    FROM resultados_palpacion
    WHERE id_resultado_palpacion = NEW.id_resultado_palpacion;

    IF v_emp_res IS NOT NULL AND v_emp_res <> NEW.empresa_id THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El resultado_palpacion no pertenece a la empresa (ni es global)';
    END IF;
  END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador ganadex.trg_es_validar_enfermedad_bi
DROP TRIGGER IF EXISTS `trg_es_validar_enfermedad_bi`;
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='';
DELIMITER //
CREATE TRIGGER `trg_es_validar_enfermedad_bi` BEFORE INSERT ON `eventos_sanitarios` FOR EACH ROW BEGIN
  DECLARE v_emp BIGINT UNSIGNED;
  IF NEW.id_enfermedad IS NOT NULL THEN
    SELECT empresa_id INTO v_emp
    FROM enfermedades
    WHERE id_enfermedad = NEW.id_enfermedad;

    IF v_emp IS NOT NULL AND v_emp <> NEW.empresa_id THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'La enfermedad no pertenece a la empresa (ni es global)';
    END IF;
  END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador ganadex.trg_es_validar_enfermedad_bu
DROP TRIGGER IF EXISTS `trg_es_validar_enfermedad_bu`;
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='';
DELIMITER //
CREATE TRIGGER `trg_es_validar_enfermedad_bu` BEFORE UPDATE ON `eventos_sanitarios` FOR EACH ROW BEGIN
  DECLARE v_emp BIGINT UNSIGNED;
  IF NEW.id_enfermedad IS NOT NULL THEN
    SELECT empresa_id INTO v_emp
    FROM enfermedades
    WHERE id_enfermedad = NEW.id_enfermedad;

    IF v_emp IS NOT NULL AND v_emp <> NEW.empresa_id THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'La enfermedad no pertenece a la empresa (ni es global)';
    END IF;
  END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador ganadex.trg_pe_validar_protocolo_bi
DROP TRIGGER IF EXISTS `trg_pe_validar_protocolo_bi`;
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='';
DELIMITER //
CREATE TRIGGER `trg_pe_validar_protocolo_bi` BEFORE INSERT ON `protocolo_ejecuciones` FOR EACH ROW BEGIN
  DECLARE v_emp BIGINT UNSIGNED;
  SELECT empresa_id INTO v_emp
  FROM protocolos
  WHERE id_protocolo = NEW.id_protocolo;

  IF v_emp IS NOT NULL AND v_emp <> NEW.empresa_id THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'El protocolo no pertenece a la empresa (ni es global)';
  END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador ganadex.trg_pe_validar_protocolo_bu
DROP TRIGGER IF EXISTS `trg_pe_validar_protocolo_bu`;
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='';
DELIMITER //
CREATE TRIGGER `trg_pe_validar_protocolo_bu` BEFORE UPDATE ON `protocolo_ejecuciones` FOR EACH ROW BEGIN
  DECLARE v_emp BIGINT UNSIGNED;
  SELECT empresa_id INTO v_emp
  FROM protocolos
  WHERE id_protocolo = NEW.id_protocolo;

  IF v_emp IS NOT NULL AND v_emp <> NEW.empresa_id THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'El protocolo no pertenece a la empresa (ni es global)';
  END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador ganadex.trg_rec_validar_refs_bi
DROP TRIGGER IF EXISTS `trg_rec_validar_refs_bi`;
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='';
DELIMITER //
CREATE TRIGGER `trg_rec_validar_refs_bi` BEFORE INSERT ON `recordatorios` FOR EACH ROW BEGIN
  DECLARE v_emp_trat BIGINT UNSIGNED;
  DECLARE v_emp_ret BIGINT UNSIGNED;

  IF NEW.id_tratamiento IS NOT NULL THEN
    SELECT empresa_id INTO v_emp_trat
    FROM tratamientos
    WHERE id_tratamiento = NEW.id_tratamiento;

    IF v_emp_trat IS NULL OR v_emp_trat <> NEW.empresa_id THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El tratamiento ligado al recordatorio no pertenece a la empresa';
    END IF;
  END IF;

  IF NEW.id_retiro IS NOT NULL THEN
    SELECT t.empresa_id INTO v_emp_ret
    FROM retiros r
    JOIN tratamientos t ON t.id_tratamiento = r.id_tratamiento
    WHERE r.id_retiro = NEW.id_retiro;

    IF v_emp_ret IS NULL OR v_emp_ret <> NEW.empresa_id THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El retiro ligado al recordatorio no pertenece a la empresa';
    END IF;
  END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador ganadex.trg_rec_validar_refs_bu
DROP TRIGGER IF EXISTS `trg_rec_validar_refs_bu`;
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='';
DELIMITER //
CREATE TRIGGER `trg_rec_validar_refs_bu` BEFORE UPDATE ON `recordatorios` FOR EACH ROW BEGIN
  DECLARE v_emp_trat BIGINT UNSIGNED;
  DECLARE v_emp_ret BIGINT UNSIGNED;

  IF NEW.id_tratamiento IS NOT NULL THEN
    SELECT empresa_id INTO v_emp_trat
    FROM tratamientos
    WHERE id_tratamiento = NEW.id_tratamiento;

    IF v_emp_trat IS NULL OR v_emp_trat <> NEW.empresa_id THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El tratamiento ligado al recordatorio no pertenece a la empresa';
    END IF;
  END IF;

  IF NEW.id_retiro IS NOT NULL THEN
    SELECT t.empresa_id INTO v_emp_ret
    FROM retiros r
    JOIN tratamientos t ON t.id_tratamiento = r.id_tratamiento
    WHERE r.id_retiro = NEW.id_retiro;

    IF v_emp_ret IS NULL OR v_emp_ret <> NEW.empresa_id THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El retiro ligado al recordatorio no pertenece a la empresa';
    END IF;
  END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador ganadex.trg_ret_validar_tipo_bi
DROP TRIGGER IF EXISTS `trg_ret_validar_tipo_bi`;
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='';
DELIMITER //
CREATE TRIGGER `trg_ret_validar_tipo_bi` BEFORE INSERT ON `retiros` FOR EACH ROW BEGIN
  DECLARE v_emp_tx BIGINT UNSIGNED;
  DECLARE v_emp_tr BIGINT UNSIGNED;

  SELECT empresa_id INTO v_emp_tx
  FROM tratamientos
  WHERE id_tratamiento = NEW.id_tratamiento;

  SELECT empresa_id INTO v_emp_tr
  FROM tipos_retiro
  WHERE id_tipo_retiro = NEW.id_tipo_retiro;

  IF v_emp_tx IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Tratamiento no encontrado para validar retiro';
  END IF;

  IF v_emp_tr IS NOT NULL AND v_emp_tr <> v_emp_tx THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'El tipo_retiro no pertenece a la empresa del tratamiento (ni es global)';
  END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador ganadex.trg_ret_validar_tipo_bu
DROP TRIGGER IF EXISTS `trg_ret_validar_tipo_bu`;
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='';
DELIMITER //
CREATE TRIGGER `trg_ret_validar_tipo_bu` BEFORE UPDATE ON `retiros` FOR EACH ROW BEGIN
  DECLARE v_emp_tx BIGINT UNSIGNED;
  DECLARE v_emp_tr BIGINT UNSIGNED;

  SELECT empresa_id INTO v_emp_tx
  FROM tratamientos
  WHERE id_tratamiento = NEW.id_tratamiento;

  SELECT empresa_id INTO v_emp_tr
  FROM tipos_retiro
  WHERE id_tipo_retiro = NEW.id_tipo_retiro;

  IF v_emp_tx IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Tratamiento no encontrado para validar retiro';
  END IF;

  IF v_emp_tr IS NOT NULL AND v_emp_tr <> v_emp_tx THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'El tipo_retiro no pertenece a la empresa del tratamiento (ni es global)';
  END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador ganadex.trg_tf_validaciones_bi
DROP TRIGGER IF EXISTS `trg_tf_validaciones_bi`;
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='';
DELIMITER //
CREATE TRIGGER `trg_tf_validaciones_bi` BEFORE INSERT ON `transacciones_financieras` FOR EACH ROW BEGIN
  DECLARE v_cat_emp BIGINT UNSIGNED;
  DECLARE v_cat_tipo BIGINT UNSIGNED;
  DECLARE v_tipo_emp BIGINT UNSIGNED;

  SELECT empresa_id, id_tipo_transaccion
    INTO v_cat_emp, v_cat_tipo
  FROM categorias_financieras
  WHERE id_categoria_financiera = NEW.id_categoria_financiera;

  SELECT empresa_id
    INTO v_tipo_emp
  FROM tipos_transaccion
  WHERE id_tipo_transaccion = NEW.id_tipo_transaccion;

  IF v_cat_emp IS NOT NULL AND v_cat_emp <> NEW.empresa_id THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'La categoria_financiera no pertenece a la empresa (ni es global)';
  END IF;

  IF v_tipo_emp IS NOT NULL AND v_tipo_emp <> NEW.empresa_id THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'El tipo_transaccion no pertenece a la empresa (ni es global)';
  END IF;

  IF v_cat_tipo IS NULL OR v_cat_tipo <> NEW.id_tipo_transaccion THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'La categoria_financiera no coincide con el tipo_transaccion de la transaccion';
  END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador ganadex.trg_tf_validaciones_bu
DROP TRIGGER IF EXISTS `trg_tf_validaciones_bu`;
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='';
DELIMITER //
CREATE TRIGGER `trg_tf_validaciones_bu` BEFORE UPDATE ON `transacciones_financieras` FOR EACH ROW BEGIN
  DECLARE v_cat_emp BIGINT UNSIGNED;
  DECLARE v_cat_tipo BIGINT UNSIGNED;
  DECLARE v_tipo_emp BIGINT UNSIGNED;

  SELECT empresa_id, id_tipo_transaccion
    INTO v_cat_emp, v_cat_tipo
  FROM categorias_financieras
  WHERE id_categoria_financiera = NEW.id_categoria_financiera;

  SELECT empresa_id
    INTO v_tipo_emp
  FROM tipos_transaccion
  WHERE id_tipo_transaccion = NEW.id_tipo_transaccion;

  IF v_cat_emp IS NOT NULL AND v_cat_emp <> NEW.empresa_id THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'La categoria_financiera no pertenece a la empresa (ni es global)';
  END IF;

  IF v_tipo_emp IS NOT NULL AND v_tipo_emp <> NEW.empresa_id THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'El tipo_transaccion no pertenece a la empresa (ni es global)';
  END IF;

  IF v_cat_tipo IS NULL OR v_cat_tipo <> NEW.id_tipo_transaccion THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'La categoria_financiera no coincide con el tipo_transaccion de la transaccion';
  END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador ganadex.trg_tr_validar_refs_bi
DROP TRIGGER IF EXISTS `trg_tr_validar_refs_bi`;
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='';
DELIMITER //
CREATE TRIGGER `trg_tr_validar_refs_bi` BEFORE INSERT ON `tratamientos` FOR EACH ROW BEGIN
  DECLARE v_emp_med BIGINT UNSIGNED;
  DECLARE v_emp_ev BIGINT UNSIGNED;

  SELECT empresa_id INTO v_emp_med
  FROM medicamentos
  WHERE id_medicamento = NEW.id_medicamento;

  IF v_emp_med IS NOT NULL AND v_emp_med <> NEW.empresa_id THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'El medicamento no pertenece a la empresa (ni es global)';
  END IF;

  IF NEW.id_evento_sanitario IS NOT NULL THEN
    SELECT empresa_id INTO v_emp_ev
    FROM eventos_sanitarios
    WHERE id_evento_sanitario = NEW.id_evento_sanitario;

    IF v_emp_ev IS NULL OR v_emp_ev <> NEW.empresa_id THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El evento_sanitario no pertenece a la misma empresa del tratamiento';
    END IF;
  END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador ganadex.trg_tr_validar_refs_bu
DROP TRIGGER IF EXISTS `trg_tr_validar_refs_bu`;
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='';
DELIMITER //
CREATE TRIGGER `trg_tr_validar_refs_bu` BEFORE UPDATE ON `tratamientos` FOR EACH ROW BEGIN
  DECLARE v_emp_med BIGINT UNSIGNED;
  DECLARE v_emp_ev BIGINT UNSIGNED;

  SELECT empresa_id INTO v_emp_med
  FROM medicamentos
  WHERE id_medicamento = NEW.id_medicamento;

  IF v_emp_med IS NOT NULL AND v_emp_med <> NEW.empresa_id THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'El medicamento no pertenece a la empresa (ni es global)';
  END IF;

  IF NEW.id_evento_sanitario IS NOT NULL THEN
    SELECT empresa_id INTO v_emp_ev
    FROM eventos_sanitarios
    WHERE id_evento_sanitario = NEW.id_evento_sanitario;

    IF v_emp_ev IS NULL OR v_emp_ev <> NEW.empresa_id THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El evento_sanitario no pertenece a la misma empresa del tratamiento';
    END IF;
  END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador ganadex.trg_vacn_validar_vacuna_bi
DROP TRIGGER IF EXISTS `trg_vacn_validar_vacuna_bi`;
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='';
DELIMITER //
CREATE TRIGGER `trg_vacn_validar_vacuna_bi` BEFORE INSERT ON `vacunaciones` FOR EACH ROW BEGIN
  DECLARE v_emp BIGINT UNSIGNED;
  SELECT empresa_id INTO v_emp
  FROM vacunas
  WHERE id_vacuna = NEW.id_vacuna;

  IF v_emp IS NOT NULL AND v_emp <> NEW.empresa_id THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'La vacuna no pertenece a la empresa (ni es global)';
  END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador ganadex.trg_vacn_validar_vacuna_bu
DROP TRIGGER IF EXISTS `trg_vacn_validar_vacuna_bu`;
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='';
DELIMITER //
CREATE TRIGGER `trg_vacn_validar_vacuna_bu` BEFORE UPDATE ON `vacunaciones` FOR EACH ROW BEGIN
  DECLARE v_emp BIGINT UNSIGNED;
  SELECT empresa_id INTO v_emp
  FROM vacunas
  WHERE id_vacuna = NEW.id_vacuna;

  IF v_emp IS NOT NULL AND v_emp <> NEW.empresa_id THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'La vacuna no pertenece a la empresa (ni es global)';
  END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
