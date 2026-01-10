import {
  IsOptional,
  IsString,
  IsIn,
  IsDateString,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAnimalDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  nombre?: string;

  @IsIn(['M', 'F'])
  sexo: 'M' | 'F';

  @IsOptional()
  @IsDateString()
  fecha_nacimiento?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  fecha_nacimiento_estimada?: boolean;

  @IsOptional()
  @IsString()
  id_raza?: string;

  @IsOptional()
  @IsString()
  padre_id?: string;

  @IsOptional()
  @IsString()
  madre_id?: string;

  @IsString()
  id_finca: string;

  @IsOptional()
  @IsString()
  notas?: string;
}
