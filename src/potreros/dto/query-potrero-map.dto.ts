import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryPotreroMapDto {
  @IsOptional()
  @IsString()
  id_finca?: string;

  @IsOptional()
  @IsString()
  q?: string;

  // ✅ límite más alto para contexto de mapa
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number;
}
