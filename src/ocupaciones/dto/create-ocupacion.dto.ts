import { IsString, IsOptional, MaxLength, IsDateString } from 'class-validator';

export class CreateOcupacionDto {
  @IsString()
  id_finca: string;

  @IsString()
  id_potrero: string;

  @IsString()
  id_lote: string;

  @IsDateString()
  fecha_inicio: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notas?: string;
}
