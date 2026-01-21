import { IsString, IsDateString, IsOptional, MaxLength } from 'class-validator';

export class CreateCategoriaHistorialDto {
  @IsString()
  id_categoria_animal: string;

  @IsDateString()
  fecha_inicio: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observaciones?: string;
}
