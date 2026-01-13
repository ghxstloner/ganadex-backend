import {
  IsString,
  IsOptional,
  IsDateString,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateIdentificacionDto {
  @IsString()
  id_tipo_identificacion: string;

  @IsString()
  @MaxLength(120)
  valor: string;

  @IsDateString()
  fecha_asignacion: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  activo?: boolean = true;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  es_principal?: boolean = false;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
