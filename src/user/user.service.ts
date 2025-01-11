import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ApiResponse } from 'src/helpers/api-response.type';
import { CloudinaryFolders } from 'src/helpers/cloudinary-folders';
import { errorMessages } from 'src/helpers/error-messages';
import { sanitizeUserData } from 'src/helpers/sanitize-user-data';
import { PasswordService } from 'src/password/password.service';
import { SendgridService } from 'src/sendgrid/sendgrid.service';
import { v4 } from 'uuid';
import { EditPasswordDto } from './dto/edit-password.dto';
import { EmailDto } from './dto/email.dto';
import { ProfileDto } from './dto/profile.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { User } from './schemes/user.schema';
import { UserInfo } from './types/user-info';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly sendgridService: SendgridService,
    private readonly passwordService: PasswordService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async activationEmail(activationToken: string): Promise<ApiResponse> {
    const user = await this.userModel.findOne({ activationToken });

    if (!user) {
      return {
        success: false,
        statusCode: HttpStatus.NOT_FOUND,
        message: errorMessages.ACTIVATION_TOKEN_ERROR,
      };
    }

    const options = { activationToken: null, isActivated: true };
    await this.userModel.findByIdAndUpdate(user._id, options);

    return {
      success: true,
      statusCode: HttpStatus.OK,
    };
  }

  async requestActivationEmailResend(dto: EmailDto): Promise<ApiResponse> {
    const { email } = dto;
    const user = await this.userModel.findOne({ email });
    const activationToken = v4();

    if (!user) {
      return {
        success: false,
        statusCode: HttpStatus.NOT_FOUND,
        message: errorMessages.USER_NOT_FOUND,
      };
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(
      user._id,
      {
        isActivated: false,
        activationToken,
      },
      { new: true },
    );

    await this.sendgridService.sendConfirmEmailLetter(
      updatedUser.email,
      updatedUser.activationToken,
    );

    return {
      success: true,
      statusCode: HttpStatus.OK,
    };
  }

  async editProfile(
    userId: string,
    dto: ProfileDto,
  ): Promise<ApiResponse<UserInfo>> {
    if (!userId) {
      return {
        success: false,
        statusCode: HttpStatus.UNAUTHORIZED,
        message: errorMessages.USER_NOT_AUTHORIZED,
      };
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(userId, dto, {
      new: true,
    });

    if (!updatedUser) {
      return {
        success: false,
        statusCode: HttpStatus.NOT_FOUND,
        message: errorMessages.USER_NOT_FOUND,
      };
    }

    const userInfo = sanitizeUserData(updatedUser);

    return {
      success: true,
      statusCode: HttpStatus.OK,
      data: userInfo,
    };
  }

  async editEmail(
    userId: string,
    dto: EmailDto,
  ): Promise<ApiResponse<UserInfo>> {
    const { email } = dto;

    if (!userId) {
      return {
        success: false,
        statusCode: HttpStatus.UNAUTHORIZED,
        message: errorMessages.USER_NOT_AUTHORIZED,
      };
    }

    const activationToken = v4();
    await this.sendgridService.sendConfirmEmailLetter(email, activationToken);

    const emailDto = { email, activationToken, isActivated: false };
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      emailDto,
      {
        new: true,
      },
    );

    const userInfo = sanitizeUserData(updatedUser);

    return {
      success: true,
      statusCode: HttpStatus.OK,
      data: userInfo,
    };
  }

  async requestResetPassword(dto: EmailDto): Promise<ApiResponse> {
    const { email } = dto;
    const user = await this.userModel.findOne({ email });

    if (!user) {
      return {
        success: false,
        statusCode: HttpStatus.NOT_FOUND,
        message: errorMessages.USER_NOT_FOUND,
      };
    }

    const resetToken = v4();

    await this.userModel.findByIdAndUpdate(user._id, { resetToken });
    await this.sendgridService.sendPasswordResetEmail(user.email, resetToken);

    return {
      success: true,
      statusCode: HttpStatus.OK,
    };
  }

  async verifyResetToken(resetToken: string): Promise<ApiResponse> {
    const user = await this.userModel.findOne({ resetToken });

    if (!user) {
      return {
        success: false,
        statusCode: HttpStatus.NOT_FOUND,
        message: errorMessages.USER_NOT_FOUND,
      };
    }

    return {
      success: true,
      statusCode: HttpStatus.OK,
    };
  }

  async resetPassword(
    dto: ResetPasswordDto,
    resetToken: string,
  ): Promise<ApiResponse> {
    const user = await this.userModel.findOne({ resetToken });

    if (!user) {
      return {
        success: false,
        statusCode: HttpStatus.NOT_FOUND,
        message: errorMessages.USER_NOT_FOUND,
      };
    }

    const { password } = dto;
    const hashPassword = await this.passwordService.createPassword(password);

    await this.userModel.findByIdAndUpdate(user._id, {
      password: hashPassword,
      resetToken: null,
    });

    await this.sendgridService.sendPasswordChangedSuccess(user.email);

    return {
      success: true,
      statusCode: HttpStatus.OK,
    };
  }

  async editPassword(
    dto: EditPasswordDto,
    userId: string,
  ): Promise<ApiResponse> {
    const user = await this.userModel.findById(userId);
    const isValidPassword = await this.passwordService.checkPassword(
      dto.password,
      user.password,
    );

    if (!user || !isValidPassword) {
      return {
        success: false,
        statusCode: HttpStatus.UNAUTHORIZED,
        message: errorMessages.USER_NOT_AUTHORIZED,
      };
    }

    const hashPassword = await this.passwordService.createPassword(
      dto.newPassword,
    );

    await this.userModel.findByIdAndUpdate(userId, { password: hashPassword });
    await this.sendgridService.sendPasswordChangedSuccess(user.email);

    return {
      success: true,
      statusCode: HttpStatus.OK,
    };
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
      folderPath: avatarPublicId,
      userId,
      fieldToUpdate: ['avatars', 'resources'],
    });
  }
}
