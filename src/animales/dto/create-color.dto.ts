import { IsString, MaxLength } from 'class-validator';

export class CreateColorDto {
  @IsString()
  @MaxLength(40)
  codigo: string;

  @IsString()
  @MaxLength(120)
  nombre: string;
}
