import { IsString, IsOptional, MaxLength } from 'class-validator';

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

    // El frontend envía estado como string, el backend lo resuelve a id_estado_potrero
    @IsOptional()
    @IsString()
    estado?: string;

    @IsOptional()
    @IsString()
    capacidad_animales?: string;

    @IsOptional()
    @IsString()
    notas?: string;
}
