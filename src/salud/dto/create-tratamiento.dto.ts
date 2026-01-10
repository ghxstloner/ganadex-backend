import {
  IsString,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTratamientoDto {
  @IsString()
  id_animal: string;

  @IsOptional()
  @IsString()
  id_evento_sanitario?: string;

  @IsDateString()
  fecha_inicio: string;

  @IsString()
  id_medicamento: string;

  @IsOptional()
  @IsString()
  dosis?: string;

  @IsOptional()
  @IsString()
  via_administracion?: string;

  @IsOptional()
  @IsString()
  notas?: string;

  // Optional withdrawal period info
  @IsOptional()
  @IsString()
  id_tipo_retiro?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(0)
  dias_retiro?: number;
}
