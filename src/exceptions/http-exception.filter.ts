import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const message =
            exception instanceof HttpException
                ? exception.getResponse()
                : 'Внутренняя ошибка сервера';

        // Расширенное логирование для отладки
        this.logger.error(
            `Статус ${status} Ошибка на ${request.url} | Метод: ${request.method}`,
            exception instanceof Error ? exception.stack : 'Неизвестная ошибка'
        );

        if (process.env.NODE_ENV !== 'production') {
            response.status(status).json({
                statusCode: status,
                timestamp: new Date().toISOString(),
                path: request.url,
                method: request.method,
                message: message,
                error: exception instanceof Error ? {
                    name: exception.name,
                    message: exception.message,
                    stack: exception.stack
                } : 'Неизвестная ошибка'
            });
        } else {
            response.status(status).json({
                statusCode: status,
                timestamp: new Date().toISOString(),
                path: request.url,
                message: message
            });
        }
    }
}