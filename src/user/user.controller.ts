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
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { DEFAULT_FOLDER_FOR_FILES } from 'src/helpers/default-file-folder';
import { ApiResponse } from 'src/response/types/api-response.type';
import { User } from './decorators/user.decorator';
import { EditPasswordDto } from './dto/edit-password.dto';
import { EmailDto } from './dto/email.dto';
import { ProfileDto } from './dto/profile.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { imageValidator } from './pipes/image-validator.pipe';
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
    return await this.userService.activationEmail(activationToken);
  }

  @Auth()
  @HttpCode(HttpStatus.OK)
  @Post('request-activation-email-resend')
  async requestActivationEmailResend(
    @Body() dto: EmailDto,
  ): Promise<ApiResponse> {
    return await this.userService.requestActivationEmailResend(dto);
  }

  @Auth()
  @Patch('edit-profile')
  async editProfile(
    @Body() dto: ProfileDto,
    @User('_id') userId: string,
  ): Promise<ApiResponse<UserInfo>> {
    return await this.userService.editProfile(userId, dto);
  }

  @Auth()
  @Patch('edit-email')
  async editEmail(
    @Body() dto: EmailDto,
    @User('_id') userId: string,
  ): Promise<ApiResponse<UserInfo>> {
    return await this.userService.editEmail(userId, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('request-reset-password')
  async requestResetPassword(@Body() dto: EmailDto): Promise<ApiResponse> {
    return await this.userService.requestResetPassword(dto);
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
    }

    return data;
  }

  @HttpCode(HttpStatus.OK)
  @Post('reset-password/:resetToken')
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @Param('resetToken') resetToken: string,
  ): Promise<ApiResponse> {
    return await this.userService.resetPassword(dto, resetToken);
  }

  @Auth()
  @Patch('edit-password')
  async editPassword(
    @Body() dto: EditPasswordDto,
    @User('_id') userId: string,
  ): Promise<ApiResponse> {
    return await this.userService.editPassword(dto, userId);
  }

  @Auth()
  @HttpCode(HttpStatus.OK)
  @Post('upload-avatar')
  @UseInterceptors(
    FileInterceptor('avatar', { dest: DEFAULT_FOLDER_FOR_FILES }),
  )
  async uploadAvatar(
    @UploadedFile(imageValidator)
    file: Express.Multer.File,
    @User('_id') userId: string,
  ): Promise<ApiResponse<UserInfo>> {
    return await this.userService.uploadAvatar(file, userId);
  }

  @Auth()
  @Delete('delete-avatar')
  async deleteAvatar(
    @User('_id') userId: string,
    @Query('avatarPublicId') avatarPublicId: string,
  ): Promise<ApiResponse<UserInfo>> {
    return await this.userService.deleteAvatar(avatarPublicId, userId);
  }

  @Auth()
  @Patch('select-avatar')
  async selectAvatar(
    @User('_id') userId: string,
    @Query('avatarPublicId') avatarPublicId: string,
  ): Promise<ApiResponse<UserInfo>> {
    return await this.userService.selectAvatar(avatarPublicId, userId);
  }

  @Auth()
  @Delete('delete-all-avatars')
  async deleteAllAvatars(
    @User('_id') userId: string,
  ): Promise<ApiResponse<UserInfo>> {
    return await this.userService.deleteAllAvatars(userId);
  }

  @Auth()
  @HttpCode(HttpStatus.OK)
  @Post('upload-poster')
  @UseInterceptors(
    FileInterceptor('poster', { dest: DEFAULT_FOLDER_FOR_FILES }),
  )
  async uploadPoster(
    @UploadedFile(imageValidator)
    file: Express.Multer.File,
    @User('_id') userId: string,
  ): Promise<ApiResponse<UserInfo>> {
    return await this.userService.uploadPoster(file, userId);
  }

  @Auth()
  @Delete('delete-poster')
  async deletePoster(
    @User('_id') userId: string,
    @Query('posterPublicId') posterPublicId: string,
  ): Promise<ApiResponse<UserInfo>> {
    return await this.userService.deletePoster(posterPublicId, userId);
  }

  @Auth()
  @Patch('select-poster')
  async selectPoster(
    @User('_id') userId: string,
    @Query('posterPublicId') posterPublicId: string,
  ): Promise<ApiResponse<UserInfo>> {
    return await this.userService.selectPoster(posterPublicId, userId);
  }

  @Auth()
  @Delete('delete-all-posters')
  async deleteAllPosters(
    @User('_id') userId: string,
  ): Promise<ApiResponse<UserInfo>> {
    return await this.userService.deleteAllPosters(userId);
  }

  @Auth()
  @Get('current-user')
  async getCurrentUser(
    @User('_id') userId: string,
  ): Promise<ApiResponse<UserInfo>> {
    return await this.userService.getCurrentUser(userId);
  }

  @Auth()
  @Delete('delete-profile')
  async deleteProfile(@User('_id') userId: string): Promise<ApiResponse> {
    return await this.userService.deleteProfile(userId);
  }
}
