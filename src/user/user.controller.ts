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
import { EditPasswordDto } from './dto/edit-password.dto';
import { EmailDto } from './dto/email.dto';
import { PasswordDto } from './dto/password.dto';
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

  @Auth()
  @Patch('edit-email')
  async editEmail(
    @Body() dto: EmailDto,
    @User('_id') userId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<UserInfo>> {
    const data = await this.userService.editEmail(userId, dto);
    if (!data.success) res.status(data.statusCode);
    return data;
  }

  @HttpCode(HttpStatus.OK)
  @Post('request-reset-password')
  async requestResetPassword(
    @Body() dto: EmailDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse> {
    const data = await this.userService.requestResetPassword(dto);
    if (!data.success) res.status(data.statusCode);
    return data;
  }

  @Get('verify-reset-token/:resetToken')
  async verifyResetToken(
    @Param('resetToken') resetToken: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse> {
    const data = await this.userService.verifyResetToken(resetToken);
    const clientUrl = this.configService.get('CLIENT_URL');

    if (data.success) {
      res.redirect(`${clientUrl}reset-password?valid=true`);
    } else {
      res.redirect(`${clientUrl}reset-password?valid=false`);
      res.status(data.statusCode);
    }

    return data;
  }

  @HttpCode(HttpStatus.OK)
  @Post('reset-password/:resetToken')
  async resetPassword(
    @Body() dto: PasswordDto,
    @Param('resetToken') resetToken: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse> {
    const data = await this.userService.resetPassword(dto, resetToken);
    if (!data.success) res.status(data.statusCode);
    return data;

    return data;
  }

  @Auth()
  @Patch('edit-password')
  async editPassword(
    @Body() dto: EditPasswordDto,
    @User('_id') userId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse> {
    const data = await this.userService.editPassword(dto, userId);
    if (!data.success) res.status(data.statusCode);
    return data;
  }
}
