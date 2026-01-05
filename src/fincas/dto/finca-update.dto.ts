import { Transform } from 'class-transformer';
import { IsOptional, IsString, Matches } from 'class-validator';
import { trimOrUndefined } from '../../common/utils/trim-or-undefined';

export class FincaUpdateDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => trimOrUndefined(value))
  nombre?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d+$/)
  @Transform(({ value }) => trimOrUndefined(value))
  moneda_base_id?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d+(?:\.\d+)?$/)
  @Transform(({ value }) => trimOrUndefined(value))
  area_hectareas?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => trimOrUndefined(value))
  direccion?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => trimOrUndefined(value))
  notas?: string;
}
