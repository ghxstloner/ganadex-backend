import { IsString, IsDateString, IsOptional, MaxLength } from 'class-validator';

export class CreateEstadoHistorialDto {
  @IsString()
  id_estado_animal: string;

  @IsDateString()
  fecha_inicio: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  motivo?: string;
}