import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateEventoReproductivoDto {
    @IsString()
    id_animal: string;

    @IsString()
    id_tipo_evento_reproductivo: string;

    @IsDateString()
    fecha: string;

    @IsOptional()
    @IsString()
    detalles?: string;

    @IsOptional()
    @IsString()
    id_resultado_palpacion?: string;

    @IsOptional()
    @IsString()
    reproductor_id?: string;

    @IsOptional()
    @IsString()
    reproductor_identificacion?: string;
}
