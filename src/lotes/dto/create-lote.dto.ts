import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateLoteDto {
  @IsString()
  id_finca: string;

  @IsString()
  @MaxLength(160)
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  activo?: boolean = true;
}
