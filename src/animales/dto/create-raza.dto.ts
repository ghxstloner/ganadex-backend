import { IsString, MaxLength, IsOptional } from 'class-validator';

export class CreateRazaDto {
  @IsString()
  @MaxLength(60)
  codigo: string;

  @IsString()
  @MaxLength(140)
  nombre: string;
}
