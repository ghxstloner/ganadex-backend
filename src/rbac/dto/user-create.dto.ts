import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { trimOrUndefined } from '../../common/utils/trim-or-undefined';

export class UserCreateDto {
  @IsEmail()
  @Transform(({ value }) => {
    const trimmed = trimOrUndefined(value);
    return typeof trimmed === 'string' ? trimmed.toLowerCase() : trimmed;
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => trimOrUndefined(value))
  nombre: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => trimOrUndefined(value))
  telefono?: string;

  @IsString()
  @Matches(/^\d+$/)
  @Transform(({ value }) => trimOrUndefined(value))
  rol_id: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @Transform(({ value }) => trimOrUndefined(value))
  password?: string;
}
