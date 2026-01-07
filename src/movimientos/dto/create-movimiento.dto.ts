import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateMovimientoDto {
    @IsString()
    id_finca: string;

    @IsDateString()
    fecha_hora: string;

    @IsString()
    id_animal: string;

    @IsOptional()
    @IsString()
    lote_origen_id?: string;

    @IsOptional()
    @IsString()
    lote_destino_id?: string;

    @IsOptional()
    @IsString()
    potrero_origen_id?: string;

    @IsOptional()
    @IsString()
    potrero_destino_id?: string;

    @IsOptional()
    @IsString()
    id_motivo_movimiento?: string;

    @IsOptional()
    @IsString()
    observaciones?: string;
}
