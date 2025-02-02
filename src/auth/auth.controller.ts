import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { cookieKeys, cookieOptions } from 'src/helpers/cookie-options';
import { ApiResponse } from 'src/response/types/api-response.type';
import { AuthService } from './auth.service';
import { Auth } from './decorators/auth.decorator';
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
    }

    return data;
  }

  @Auth()
  @Get('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse | ApiResponse> {
    const refreshToken = req.cookies[cookieKeys.REFRESH_TOKEN];
    const data = await this.authService.logout(refreshToken);

    if (data.success) {
      res.clearCookie(cookieKeys.REFRESH_TOKEN, cookieOptions);
    }

    return data;
  }

  @Auth()
  @Get('refresh-token')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<AuthResponse> | ApiResponse> {
    const refreshToken = req.cookies[cookieKeys.REFRESH_TOKEN];
    const data = await this.authService.refreshToken(refreshToken);

    if (data.success) {
      const refreshToken = data.data?.tokens.refreshToken;
      res.cookie(cookieKeys.REFRESH_TOKEN, refreshToken, cookieOptions);
    }

    return data;
  }

  @Post('google-auth')
  async googleAuth(
    @Body('token') token: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<AuthResponse> | ApiResponse> {
    const data = await this.authService.googleAuth(token);

    if (data.success) {
      const refreshToken = data.data?.tokens.refreshToken;
      res.cookie(cookieKeys.REFRESH_TOKEN, refreshToken, cookieOptions);
    }

    return data;
  }
}
