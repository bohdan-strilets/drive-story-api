import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from 'src/helpers/api-response.type';
import { cookieKeys, cookieOptions } from 'src/helpers/cookie-options';
import { AuthService } from './auth.service';
import { RegistrationDto } from './dto/registration.dto';
import { AuthResponse } from './types/auth-response.type';

@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registration')
  async registration(
    @Body() dto: RegistrationDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<AuthResponse> | ResponseType> {
    const data = await this.authService.registration(dto);

    if (data.success) {
      const refreshToken = data.data?.tokens.refreshToken;
      res.cookie(cookieKeys.REFRESH_TOKEN, refreshToken, cookieOptions);
    } else {
      res.status(data.statusCode);
    }

    return data;
  }
}
