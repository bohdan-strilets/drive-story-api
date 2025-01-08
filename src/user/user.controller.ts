import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ApiResponse } from 'src/helpers/api-response.type';
import { User } from './decorators/user.decorator';
import { EmailDto } from './dto/email.dto';
import { ProfileDto } from './dto/profile.dto';
import { UserInfo } from './types/user-info';
import { UserService } from './user.service';

@Controller('v1/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  @Get('activation-email/:activationToken')
  async activationEmail(
    @Param('activationToken') activationToken: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse> {
    const clientUrl = this.configService.get('CLIENT_URL');
    res.redirect(`${clientUrl}activation-success`);

    const data = await this.userService.activationEmail(activationToken);
    if (!data.success) res.status(data.statusCode);
    return data;
  }

  @Auth()
  @HttpCode(HttpStatus.OK)
  @Post('request-activation-email-resend')
  async requestActivationEmailResend(
    @Body() dto: EmailDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse> {
    const data = await this.userService.requestActivationEmailResend(dto);
    if (!data.success) res.status(data.statusCode);
    return data;
  }

  @Auth()
  @Patch('edit-profile')
  async editProfile(
    @Body() dto: ProfileDto,
    @User('_id') userId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<UserInfo>> {
    const data = await this.userService.editProfile(userId, dto);
    if (!data.success) res.status(data.statusCode);
    return data;
  }
}
