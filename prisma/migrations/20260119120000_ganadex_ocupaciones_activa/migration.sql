-- Add lote_actual_id to animales
ALTER TABLE `animales`
  ADD COLUMN `lote_actual_id` BIGINT UNSIGNED NULL AFTER `id_finca`;

ALTER TABLE `animales`
  ADD INDEX `idx_animales_empresa_lote_actual` (`empresa_id`, `lote_actual_id`);

-- Add generated is_active to ocupacion_potreros
ALTER TABLE `ocupacion_potreros`
  ADD COLUMN `is_active` TINYINT(1)
  GENERATED ALWAYS AS (IF(`fecha_fin` IS NULL, 1, 0)) STORED;

ALTER TABLE `ocupacion_potreros`
  ADD UNIQUE INDEX `uq_op_lote_activa` (`empresa_id`, `id_lote`, `is_active`),
  ADD UNIQUE INDEX `uq_op_potrero_activa` (`empresa_id`, `id_potrero`, `is_active`),
  ADD INDEX `idx_op_lote_fin` (`empresa_id`, `id_lote`, `fecha_fin`),
  ADD INDEX `idx_op_potrero_fin` (`empresa_id`, `id_potrero`, `fecha_fin`);

-- Add movement indexes
ALTER TABLE `movimientos_animales`
  ADD INDEX `idx_mov_animal_fecha_empresa` (`empresa_id`, `id_animal`, `fecha_hora`),
  ADD INDEX `idx_mov_lote_origen_fecha_empresa` (`empresa_id`, `lote_origen_id`, `fecha_hora`),
  ADD INDEX `idx_mov_lote_destino_fecha_empresa` (`empresa_id`, `lote_destino_id`, `fecha_hora`);
