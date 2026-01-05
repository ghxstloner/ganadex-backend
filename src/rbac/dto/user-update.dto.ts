import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { trimOrUndefined } from '../../common/utils/trim-or-undefined';

export class UserUpdateDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => trimOrUndefined(value))
  nombre?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => trimOrUndefined(value))
  telefono?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
