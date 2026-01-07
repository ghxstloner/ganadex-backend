import { IsString, IsOptional, IsDecimal, MaxLength } from 'class-validator';

export class CreatePotreroDto {
    @IsString()
    id_finca: string;

    @IsString()
    @MaxLength(160)
    nombre: string;

    @IsOptional()
    @IsString()
    area_hectareas?: string;

    @IsOptional()
    @IsString()
    id_tipo_potrero?: string;

    @IsOptional()
    @IsString()
    notas?: string;
}
