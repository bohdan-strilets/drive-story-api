import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { Response } from 'express';
import { errorMessages } from 'src/error/helpers/error-messages';
import { ResponseService } from 'src/response/response.service';
import { AppError } from './app-error';

@Injectable()
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly responseService: ResponseService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = 500;
    let message = errorMessages.INTERNAL_SERVER_ERROR;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    }

    if (exception instanceof AppError) {
      status = exception.statusCode;
      message = exception.message;
    }

    const res = this.responseService.createErrorResponse(status, message);
    response.status(status).json(res);
  }
}
