import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

type ExceptionResponse = {
  code?: string;
  message?: string | string[];
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse =
      exception instanceof HttpException ? (exception.getResponse() as ExceptionResponse) : undefined;

    const message =
      (Array.isArray(exceptionResponse?.message)
        ? exceptionResponse?.message.join(', ')
        : exceptionResponse?.message) || 'Internal server error';

    const code =
      exceptionResponse?.code ||
      (status === HttpStatus.BAD_REQUEST
        ? 'VALIDATION_ERROR'
        : status === HttpStatus.TOO_MANY_REQUESTS
          ? 'AUTH_RATE_LIMITED'
          : 'INTERNAL_ERROR');

    response.status(status).json({
      data: undefined,
      error: {
        code,
        message,
      },
    });
  }
}
