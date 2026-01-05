import { UnprocessableEntityException } from '@nestjs/common';

export const parseBigInt = (value: string, field: string) => {
  try {
    return BigInt(value);
  } catch {
    throw new UnprocessableEntityException(`${field} invalido`);
  }
};
