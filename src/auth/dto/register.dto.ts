import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

const trimOrUndefined = (value: unknown) => {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

export class RegisterDto {
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
  @MinLength(8)
  @Transform(({ value }) => trimOrUndefined(value))
  password: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d+$/)
  @Transform(({ value }) => trimOrUndefined(value))
  empresa_id?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => trimOrUndefined(value))
  empresa_nombre?: string;
}
