import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { trimOrUndefined } from '../../common/utils/trim-or-undefined';

export class EmpresaUpdateDto {
  @IsOptional()
  @IsString()
  @MaxLength(160)
  @Transform(({ value }) => trimOrUndefined(value))
  nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  @Transform(({ value }) => trimOrUndefined(value))
  documento_fiscal?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  @Transform(({ value }) => trimOrUndefined(value))
  estado?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => trimOrUndefined(value))
  notas?: string;
}
