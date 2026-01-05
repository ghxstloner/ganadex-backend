import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

const trimOrUndefined = (value: unknown) => {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

export class LoginDto {
  @IsEmail()
  @Transform(({ value }) => {
    const trimmed = trimOrUndefined(value);
    return typeof trimmed === 'string' ? trimmed.toLowerCase() : trimmed;
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => trimOrUndefined(value))
  password: string;
}
