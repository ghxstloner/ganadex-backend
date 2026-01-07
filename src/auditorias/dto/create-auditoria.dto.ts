import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateAuditoriaDto {
    @IsString()
    id_finca: string;

    @IsDateString()
    fecha_apertura: string;

    @IsString()
    id_metodo_auditoria: string;

    @IsOptional()
    @IsString()
    observaciones?: string;
}
