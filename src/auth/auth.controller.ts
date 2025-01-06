import { Body, Controller, Post } from '@nestjs/common';
import { ApiResponse } from 'src/helpers/api-response.type';
import { AuthService } from './auth.service';
import { RegistrationDto } from './dto/registration.dto';
import { AuthResponse } from './types/auth-response.type';

@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registration')
  async registration(
    @Body() dto: RegistrationDto,
  ): Promise<ApiResponse<AuthResponse> | ResponseType> {
    const data = await this.authService.registration(dto);

    return data;
  }
}
