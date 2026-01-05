import { UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';

export const getUserIdFromRequest = (request: Request) => {
  const payload = (request as Request & { user?: { sub?: string } }).user;
  if (!payload?.sub) {
    throw new UnauthorizedException('Token invalido');
  }
  return BigInt(payload.sub);
};
