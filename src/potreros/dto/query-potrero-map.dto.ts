import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryPotreroMapDto {
  @IsOptional()
  @IsString()
  id_finca?: string;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @Type(() => Number) // Convierte "300" (string) a 300 (number)
  @IsInt()
  @Min(1)
  @Max(1000) // Aumentamos un poco para mapas grandes
  limit?: number = 300; // Valor por defecto en nivel de aplicación
}
