import { Injectable } from '@nestjs/common';
import { ApiResponse } from './types/api-response.type';

@Injectable()
export class ResponseService {
  createErrorResponse(statusCode: number, message: string): ApiResponse {
    return {
      success: false,
      statusCode,
      message,
    };
  }

  createSuccessResponse<T = any>(
    statusCode: number,
    data?: T,
    message?: string,
  ): ApiResponse<T> {
    const response: ApiResponse<T> = {
      success: true,
      statusCode,
    };

    if (data !== undefined) response.data = data;
    if (message !== undefined) response.message = message;

    return response;
  }
}
