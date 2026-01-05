import {
  createParamDecorator,
  ExecutionContext,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { Request } from 'express';

type RequestWithEmpresa = Request & { empresaId?: bigint };

export const EmpresaActivaId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithEmpresa>();
    if (!request.empresaId) {
      throw new UnprocessableEntityException('Empresa activa requerida');
    }
    return request.empresaId;
  },
);
