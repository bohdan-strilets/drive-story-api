import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CloudinaryFolders } from 'src/helpers/cloudinary-folders';
import { errorMessages } from 'src/helpers/error-messages';
import { sanitizeUserData } from 'src/helpers/sanitize-user-data';
import { PasswordService } from 'src/password/password.service';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { SendgridService } from 'src/sendgrid/sendgrid.service';
import { v4 } from 'uuid';
import { EditPasswordDto } from './dto/edit-password.dto';
import { EmailDto } from './dto/email.dto';
import { ProfileDto } from './dto/profile.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { User, UserDocument } from './schemes/user.schema';
import { UserInfo } from './types/user-info';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly sendgridService: SendgridService,
    private readonly passwordService: PasswordService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly responseService: ResponseService,
  ) {}

  private async updateActivationStatus(
    userId: Types.ObjectId,
    activationToken: string | null = null,
    isActivated: boolean = false,
  ): Promise<UserDocument> {
    const options = { activationToken, isActivated };
    return await this.userModel.findByIdAndUpdate(userId, options, {
      new: true,
    });
  }

  async activationEmail(activationToken: string): Promise<ApiResponse> {
    try {
      const user = await this.userModel.findOne({ activationToken });

      if (!user) {
        return this.responseService.createErrorResponse(
          HttpStatus.NOT_FOUND,
          errorMessages.ACTIVATION_TOKEN_ERROR,
        );
      }

      await this.updateActivationStatus(user._id);
      return this.responseService.createSuccessResponse(HttpStatus.OK);
    } catch (error) {
      console.error('Activation email error:', error);
      return this.responseService.createErrorResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessages.ERROR_OCCURRED,
      );
    }
  }

  async requestActivationEmailResend(dto: EmailDto): Promise<ApiResponse> {
    try {
      const { email } = dto;

      const user = await this.userModel.findOne({ email });
      const activationToken = v4();

      if (!user) {
        return this.responseService.createErrorResponse(
          HttpStatus.NOT_FOUND,
          errorMessages.USER_NOT_FOUND,
        );
      }

      const updatedUser = await this.updateActivationStatus(
        user._id,
        activationToken,
        false,
      );

      await this.sendgridService.sendConfirmEmailLetter(
        updatedUser.email,
        updatedUser.activationToken,
      );

      return this.responseService.createSuccessResponse(HttpStatus.OK);
    } catch (error) {
      console.error('Email reactivation error:', error);
      return this.responseService.createErrorResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessages.ERROR_OCCURRED,
      );
    }
  }

  private isValidUserId(userId: string): ApiResponse | void {
    if (!userId) {
      return this.responseService.createErrorResponse(
        HttpStatus.UNAUTHORIZED,
        errorMessages.USER_NOT_AUTHORIZED,
      );
    }
  }

  private async updateUserById(
    userId: string,
    dto: any,
  ): Promise<UserDocument> {
    return await this.userModel.findByIdAndUpdate(userId, dto, {
      new: true,
    });
  }

  async editProfile(
    userId: string,
    dto: ProfileDto,
  ): Promise<ApiResponse<UserInfo>> {
    try {
      this.isValidUserId(userId);

      const updatedUser = await this.updateUserById(userId, dto);
      const userInfo = sanitizeUserData(updatedUser);

      return this.responseService.createSuccessResponse(
        HttpStatus.OK,
        userInfo,
      );
    } catch (error) {
      console.error('Edit profile error:', error);
      return this.responseService.createErrorResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessages.ERROR_OCCURRED,
      );
    }
  }

  async editEmail(
    userId: string,
    dto: EmailDto,
  ): Promise<ApiResponse<UserInfo>> {
    try {
      const { email } = dto;
      this.isValidUserId(userId);

      const activationToken = v4();
      await this.sendgridService.sendConfirmEmailLetter(email, activationToken);

      const emailDto = { email, activationToken, isActivated: false };
      const updatedUser = await this.updateUserById(userId, emailDto);
      const userInfo = sanitizeUserData(updatedUser);

      return this.responseService.createSuccessResponse(
        HttpStatus.OK,
        userInfo,
      );
    } catch (error) {
      console.error('Edit email error:', error);
      return this.responseService.createErrorResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessages.ERROR_OCCURRED,
      );
    }
  }

  private isValidUser(user: UserDocument): ApiResponse | void {
    if (!user) {
      return this.responseService.createErrorResponse(
        HttpStatus.NOT_FOUND,
        errorMessages.USER_NOT_FOUND,
      );
    }
  }

  async requestResetPassword(dto: EmailDto): Promise<ApiResponse> {
    try {
      const { email } = dto;
      const user = await this.userModel.findOne({ email });
      this.isValidUser(user);

      const resetToken = v4();
      await this.updateUserById(user._id.toString(), { resetToken });
      await this.sendgridService.sendPasswordResetEmail(user.email, resetToken);

      return this.responseService.createSuccessResponse(HttpStatus.OK);
    } catch (error) {
      console.error('Error while requesting password reset:', error);
      return this.responseService.createErrorResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessages.ERROR_OCCURRED,
      );
    }
  }

  async verifyResetToken(resetToken: string): Promise<ApiResponse> {
    try {
      const user = await this.userModel.findOne({ resetToken });
      this.isValidUser(user);

      return this.responseService.createSuccessResponse(HttpStatus.OK);
    } catch (error) {
      console.error('Password reset token verification error:', error);
      return this.responseService.createErrorResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessages.ERROR_OCCURRED,
      );
    }
  }

  async resetPassword(
    dto: ResetPasswordDto,
    resetToken: string,
  ): Promise<ApiResponse> {
    try {
      const user = await this.userModel.findOne({ resetToken });
      this.isValidUser(user);

      const { password } = dto;
      const hashPassword = await this.passwordService.createPassword(password);

      const passwordDto = { password: hashPassword, resetToken: null };
      await this.updateUserById(user._id.toString(), passwordDto);

      await this.sendgridService.sendPasswordChangedSuccess(user.email);

      return this.responseService.createSuccessResponse(HttpStatus.OK);
    } catch (error) {
      console.error('Error resetting password:', error);
      return this.responseService.createErrorResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessages.ERROR_OCCURRED,
      );
    }
  }

  async editPassword(
    dto: EditPasswordDto,
    userId: string,
  ): Promise<ApiResponse> {
    try {
      const user = await this.userModel.findById(userId);
      const isValidPassword = await this.passwordService.checkPassword(
        dto.password,
        user.password,
      );

      if (!user || !isValidPassword) {
        return this.responseService.createErrorResponse(
          HttpStatus.UNAUTHORIZED,
          errorMessages.USER_NOT_AUTHORIZED,
        );
      }

      const hashPassword = await this.passwordService.createPassword(
        dto.newPassword,
      );

      const passwordDto = { password: hashPassword };
      await this.updateUserById(userId, passwordDto);
      await this.sendgridService.sendPasswordChangedSuccess(user.email);

      return this.responseService.createSuccessResponse(HttpStatus.OK);
    } catch (error) {
      console.error('Error editing password:', error);
      return this.responseService.createErrorResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessages.ERROR_OCCURRED,
      );
    }
  }

  async uploadAvatar(
    file: Express.Multer.File,
    userId: string,
  ): Promise<ApiResponse<UserInfo>> {
    return await this.cloudinaryService.uploadFileAndUpdateModel(file, {
      model: this.userModel,
      modelId: userId,
      folderPath: CloudinaryFolders.USER_AVATAR,
      fieldToUpdate: ['avatars', 'resources'],
    });
  }

  async deleteAvatar(
    avatarPublicId: string,
    userId: string,
  ): Promise<ApiResponse<UserInfo>> {
    return await this.cloudinaryService.deleteFileAndUpdateModel({
      model: this.userModel,
      publicId: avatarPublicId,
      userId,
      fieldToUpdate: ['avatars', 'resources'],
    });
  }
}
