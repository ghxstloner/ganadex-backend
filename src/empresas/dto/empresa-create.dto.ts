import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { trimOrUndefined } from '../../common/utils/trim-or-undefined';

export class EmpresaCreateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  @Transform(({ value }) => trimOrUndefined(value))
  nombre: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  @Transform(({ value }) => trimOrUndefined(value))
  documento_fiscal?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => trimOrUndefined(value))
  notas?: string;
}
