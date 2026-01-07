import { IsString, IsOptional, IsDateString, MaxLength } from 'class-validator';

export class CreateEntregaLecheDto {
    @IsString()
    id_finca: string;

    @IsString()
    id_centro: string;

    @IsDateString()
    fecha: string;

    @IsString()
    litros_entregados: string;

    @IsOptional()
    @IsString()
    @MaxLength(120)
    referencia_guia?: string;

    @IsOptional()
    @IsString()
    notas?: string;
}
