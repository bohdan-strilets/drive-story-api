import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from 'src/helpers/api-response.type';
import { cookieKeys, cookieOptions } from 'src/helpers/cookie-options';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { AuthResponse } from './types/auth-response.type';

@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UsePipes(new ValidationPipe())
  @Post('registration')
  async registration(
    @Body() dto: AuthDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<AuthResponse> | ApiResponse> {
    const data = await this.authService.registration(dto);

    if (data.success) {
      const refreshToken = data.data?.tokens.refreshToken;
      res.cookie(cookieKeys.REFRESH_TOKEN, refreshToken, cookieOptions);
    } else {
      res.status(data.statusCode);
    }

    return data;
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() dto: AuthDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<AuthResponse> | ApiResponse> {
    const data = await this.authService.login(dto);

    if (data.success) {
      const refreshToken = data.data?.tokens.refreshToken;
      res.cookie(cookieKeys.REFRESH_TOKEN, refreshToken, cookieOptions);
    } else {
      res.status(data.statusCode);
    }

    return data;
  }
}
