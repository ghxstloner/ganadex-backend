import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import type { Response, Request } from 'express';

interface ErrorResponse {
    ok: false;
    message: string;
    code: string;
    details?: unknown;
    path: string;
    timestamp: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Error interno del servidor';
        let code = 'INTERNAL_ERROR';
        let details: unknown = undefined;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (typeof exceptionResponse === 'object') {
                const resp = exceptionResponse as Record<string, unknown>;
                message = (resp.message as string) ?? message;
                if (Array.isArray(resp.message)) {
                    message = resp.message[0] ?? message;
                    details = resp.message;
                }
            }

            code = this.getErrorCode(status);
        } else if (exception instanceof Error) {
            message = exception.message;
        }

        const errorResponse: ErrorResponse = {
            ok: false,
            message,
            code,
            path: request.url,
            timestamp: new Date().toISOString(),
        };

        if (details) {
            errorResponse.details = details;
        }

        response.status(status).json(errorResponse);
    }

    private getErrorCode(status: number): string {
        switch (status) {
            case 400:
                return 'BAD_REQUEST';
            case 401:
                return 'UNAUTHORIZED';
            case 403:
                return 'FORBIDDEN';
            case 404:
                return 'NOT_FOUND';
            case 409:
                return 'CONFLICT';
            case 422:
                return 'VALIDATION_ERROR';
            case 429:
                return 'TOO_MANY_REQUESTS';
            default:
                return 'INTERNAL_ERROR';
        }
    }
}
