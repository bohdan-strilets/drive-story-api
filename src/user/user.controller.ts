import {
  Body,
  Controller,
  Delete,
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
import { Types } from 'mongoose';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ParseObjectIdPipe } from 'src/car/pipes/parse-objectid.pipe';
import { ApiResponse } from 'src/response/types/api-response.type';
import { User } from './decorators/user.decorator';
import { EditPasswordDto } from './dto/edit-password.dto';
import { EmailDto } from './dto/email.dto';
import { ProfileDto } from './dto/profile.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CurrentCarDto } from './dto/set-current-car.dto';
import { SetPasswordDto } from './dto/set-password.dto';
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
    const data = await this.userService.activationEmail(activationToken);
    const clientUrl = this.configService.get('CLIENT_URL');

    if (data.success) {
      res.redirect(`${clientUrl}/activation-success`);
      return;
    }

    return data;
  }

  @Auth()
  @HttpCode(HttpStatus.OK)
  @Post('request-activation-email-resend')
  async requestActivationEmailResend(
    @Body() dto: EmailDto,
  ): Promise<ApiResponse> {
    return this.userService.requestActivationEmailResend(dto);
  }

  @Auth()
  @Patch('edit-profile')
  async editProfile(
    @Body() dto: ProfileDto,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<UserInfo>> {
    return this.userService.editProfile(userId, dto);
  }

  @Auth()
  @Patch('edit-email')
  async editEmail(
    @Body() dto: EmailDto,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<UserInfo>> {
    return this.userService.editEmail(userId, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('request-reset-password')
  async requestResetPassword(@Body() dto: EmailDto): Promise<ApiResponse> {
    return this.userService.requestResetPassword(dto);
  }

  @Get('verify-reset-token/:resetToken')
  async verifyResetToken(
    @Param('resetToken') resetToken: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse> {
    const data = await this.userService.verifyResetToken(resetToken);
    const clientUrl = this.configService.get('CLIENT_URL');

    if (data.success) {
      res.redirect(`${clientUrl}/reset-password/${resetToken}`);
      return;
    }

    return data;
  }

  @HttpCode(HttpStatus.OK)
  @Post('reset-password/:resetToken')
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @Param('resetToken') resetToken: string,
  ): Promise<ApiResponse> {
    return this.userService.resetPassword(dto, resetToken);
  }

  @Auth()
  @Patch('edit-password')
  async editPassword(
    @Body() dto: EditPasswordDto,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse> {
    return this.userService.editPassword(dto, userId);
  }

  @Auth()
  @Get('current-user')
  async getCurrentUser(
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<UserInfo>> {
    return this.userService.getCurrentUser(userId);
  }

  @Auth()
  @Delete('remove-profile')
  async removeProfile(
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<UserInfo>> {
    return this.userService.removeProfile(userId);
  }

  @Auth()
  @Patch('set-current-car')
  async(
    @Body() dto: CurrentCarDto,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<UserInfo>> {
    return this.userService.setCurrentCar(userId, dto);
  }

  @Auth()
  @Patch('set-password')
  async setPassword(
    @Body() dto: SetPasswordDto,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse> {
    return this.userService.setPassword(userId, dto);
  }
}
