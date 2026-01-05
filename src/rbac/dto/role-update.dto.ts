import { Transform } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { trimOrUndefined } from '../../common/utils/trim-or-undefined';

export class RoleUpdateDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => trimOrUndefined(value))
  nombre?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => trimOrUndefined(value))
  descripcion?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permisos?: string[];
}
