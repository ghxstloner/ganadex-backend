import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export type JwtPayload = {
  sub: string;
  email: string;
  empresa_activa_id?: string;
  iat?: number;
  exp?: number;
};

@Injectable()
export class JwtStrategy {
  constructor(private readonly jwtService: JwtService) {}

  async validateToken(token: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Token invalido');
    }
  }
}
