import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtStrategy } from '../strategies/jwt.strategy';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtStrategy: JwtStrategy) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException('Token invalido');
    }

    const payload = await this.jwtStrategy.validateToken(token);
    (request as Request & { user?: unknown }).user = payload;
    return true;
  }

  private extractToken(request: Request) {
    const header = request.headers.authorization;
    if (!header) {
      return null;
    }
    const [type, token] = header.split(' ');
    if (type !== 'Bearer' || !token) {
      return null;
    }
    return token;
  }
}
