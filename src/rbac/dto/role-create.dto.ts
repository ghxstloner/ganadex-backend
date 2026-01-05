import { Transform } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { trimOrUndefined } from '../../common/utils/trim-or-undefined';

export class RoleCreateDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => trimOrUndefined(value))
  nombre: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => trimOrUndefined(value))
  descripcion?: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  permisos: string[];
}
