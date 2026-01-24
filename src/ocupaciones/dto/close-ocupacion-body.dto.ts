import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class CloseOcupacionBodyDto {
  @IsOptional()
  @IsString()
  id_ocupacion?: string;

  @IsOptional()
  @IsString()
  id_potrero?: string;

  @IsOptional()
  @IsString()
  id_lote?: string;

  @IsOptional()
  @IsDateString()
  fecha_fin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notas?: string;
}
