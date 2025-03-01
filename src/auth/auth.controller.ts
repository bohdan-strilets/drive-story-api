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
import { ApiResponse } from 'src/response/types/api-response.type';
import { AuthService } from './auth.service';
import { Auth } from './decorators/auth.decorator';
import { LoginDto } from './dto/login.dto';
import { RegistrationDto } from './dto/registration.dto';
import { GoogleService } from './google.service';
import { cookieKeys, cookieOptions } from './options/cookie.option';
import { AuthResponse } from './types/auth-response.type';

@Controller('v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleService: GoogleService,
  ) {}

  @UsePipes(new ValidationPipe())
  @Post('registration')
  async registration(
    @Body() dto: RegistrationDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<AuthResponse>> {
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
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<AuthResponse>> {
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
  ): Promise<ApiResponse> {
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
  ): Promise<ApiResponse<AuthResponse>> {
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
  ): Promise<ApiResponse<AuthResponse>> {
    const data = await this.googleService.auth(token);

    if (data.success) {
      const refreshToken = data.data?.tokens.refreshToken;
      res.cookie(cookieKeys.REFRESH_TOKEN, refreshToken, cookieOptions);
    }

    return data;
  }
}
