import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface SuccessResponse<T> {
  ok: true;
  data: T;
  meta?: PaginationMeta;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

function isPaginatedResult(value: unknown): value is PaginatedResult<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'data' in value &&
    'meta' in value &&
    typeof (value as PaginatedResult<unknown>).meta === 'object' &&
    (value as PaginatedResult<unknown>).meta !== null &&
    'total' in (value as PaginatedResult<unknown>).meta
  );
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  SuccessResponse<T>
> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<SuccessResponse<T>> {
    return next.handle().pipe(
      map((value) => {
        if (isPaginatedResult(value)) {
          return {
            ok: true as const,
            data: value.data as T,
            meta: value.meta,
          };
        }
        return {
          ok: true as const,
          data: value,
        };
      }),
    );
  }
}
