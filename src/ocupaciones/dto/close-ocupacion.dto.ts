import { IsDateString, IsOptional, MaxLength, IsString } from 'class-validator';

export class CloseOcupacionDto {
  @IsDateString()
  fecha_fin: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notas?: string;
}
