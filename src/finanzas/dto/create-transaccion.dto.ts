import { IsString, IsOptional, IsDateString, MaxLength } from 'class-validator';

export class CreateTransaccionDto {
  @IsDateString()
  fecha: string;

  @IsString()
  id_tipo_transaccion: string;

  @IsString()
  id_categoria_financiera: string;

  @IsString()
  monto: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  id_tercero?: string;
}
