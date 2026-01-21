import { IsDateString, IsOptional, MaxLength, IsString } from 'class-validator';

export class CloseOcupacionDto {
  @IsOptional()
  @IsDateString()
  fecha_fin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notas?: string;
}
