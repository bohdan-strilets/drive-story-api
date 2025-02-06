import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PasswordService } from 'src/password/password.service';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { SendgridService } from 'src/sendgrid/sendgrid.service';
import { TokenService } from 'src/token/token.service';
import { getSafeUserData } from 'src/user/helpers/get-safe-data';
import { v4 } from 'uuid';
import { EditPasswordDto } from './dto/edit-password.dto';
import { EmailDto } from './dto/email.dto';
import { ProfileDto } from './dto/profile.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { User, UserDocument } from './schemes/user.schema';
import { UserInfo } from './types/user-info';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly sendgridService: SendgridService,
    private readonly passwordService: PasswordService,
    private readonly responseService: ResponseService,
    private readonly tokenService: TokenService,
    private readonly userRepository: UserRepository,
  ) {}

  async activationEmail(activationToken: string): Promise<ApiResponse> {
    const user = await this.userRepository.findUser(
      'activationToken',
      activationToken,
    );

    await this.userRepository.setActivationStatus(user._id);
    return this.responseService.createSuccessResponse(HttpStatus.OK);
  }

  async requestActivationEmailResend(dto: EmailDto): Promise<ApiResponse> {
    const { email } = dto;

    const user = await this.userRepository.findUser('email', email);
    const newActivationToken = v4();

    const updatedUser = await this.userRepository.setActivationStatus(
      user._id,
      newActivationToken,
      false,
    );

    await this.sendgridService.sendConfirmEmailLetter(
      updatedUser.email,
      updatedUser.activationToken,
    );

    return this.responseService.createSuccessResponse(HttpStatus.OK);
  }

  async editProfile(
    userId: Types.ObjectId,
    dto: ProfileDto,
  ): Promise<ApiResponse<UserInfo>> {
    const updatedUser = await this.userRepository.updateUserById(userId, dto);
    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedUser,
    );
  }

  async editEmail(
    userId: Types.ObjectId,
    dto: EmailDto,
  ): Promise<ApiResponse<UserInfo>> {
    const { email } = dto;
    await this.userRepository.findUser('email', email);

    const activationToken = v4();
    await this.sendgridService.sendConfirmEmailLetter(email, activationToken);

    const emailData = { email, activationToken, isActivated: false };
    const updatedUser = await this.userRepository.updateUserById(
      userId,
      emailData,
    );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedUser,
    );
  }

  async requestResetPassword(dto: EmailDto): Promise<ApiResponse> {
    const { email } = dto;
    const user = await this.userRepository.findUser('email', email);

    const resetToken = v4();
    await this.userRepository.updateUserById(user._id, { resetToken });
    await this.sendgridService.sendPasswordResetEmail(user.email, resetToken);

    return this.responseService.createSuccessResponse(HttpStatus.OK);
  }

  async verifyResetToken(resetToken: string): Promise<ApiResponse> {
    await this.userRepository.findUser('resetToken', resetToken);
    return this.responseService.createSuccessResponse(HttpStatus.OK);
  }

  async resetPassword(
    dto: ResetPasswordDto,
    resetToken: string,
  ): Promise<ApiResponse> {
    const user = await this.userRepository.findUser('resetToken', resetToken);

    const { password } = dto;
    const hashPassword = await this.passwordService.createPassword(password);

    const passwordDto = { password: hashPassword, resetToken: null };
    await this.userRepository.updateUserById(user._id, passwordDto);

    await this.sendgridService.sendPasswordChangedSuccess(user.email);

    return this.responseService.createSuccessResponse(HttpStatus.OK);
  }

  async editPassword(
    dto: EditPasswordDto,
    userId: Types.ObjectId,
  ): Promise<ApiResponse> {
    const user = await this.userRepository.findUser('_id', userId);
    await this.passwordService.isValidPassword(dto.password, user.password);

    const hashPassword = await this.passwordService.createPassword(
      dto.newPassword,
    );

    const passwordData = { password: hashPassword };
    await this.userRepository.updateUserById(userId, passwordData);
    await this.sendgridService.sendPasswordChangedSuccess(user.email);

    return this.responseService.createSuccessResponse(HttpStatus.OK);
  }

  async getCurrentUser(userId: Types.ObjectId): Promise<ApiResponse<UserInfo>> {
    const user = await this.userRepository.findUser('_id', userId);
    const safeData = getSafeUserData(user);

    return this.responseService.createSuccessResponse(HttpStatus.OK, safeData);
  }

  async removeProfile(userId: Types.ObjectId): Promise<ApiResponse<UserInfo>> {
    const session = await this.userModel.db.startSession();
    session.startTransaction();

    try {
      await this.userRepository.findUser('_id', userId);
      const deletedUser = await this.userModel.findByIdAndDelete(userId);
      await this.tokenService.deleteTokensByDb(new Types.ObjectId(userId));

      await session.commitTransaction();
      session.endSession();

      const safeData = getSafeUserData(deletedUser);
      return this.responseService.createSuccessResponse(
        HttpStatus.OK,
        safeData,
      );
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}
