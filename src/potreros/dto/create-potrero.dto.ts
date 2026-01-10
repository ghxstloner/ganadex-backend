import {
  IsString,
  IsOptional,
  MaxLength,
  IsArray,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

class GeometryPointDto {
  @IsOptional()
  lat?: number;

  @IsOptional()
  lng?: number;
}

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
  area_m2?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GeometryPointDto)
  geometry?: Array<{ lat: number; lng: number }>;

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
