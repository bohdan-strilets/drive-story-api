import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CarHelper } from 'src/car/car.helper';
import { CarRepository } from 'src/car/car.repository';
import { AppError } from 'src/error/app-error';
import { PasswordService } from 'src/password/password.service';
import { ResendService } from 'src/resend/resend.service';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { TokenService } from 'src/token/token.service';
import { v4 } from 'uuid';
import { EditPasswordDto } from './dto/edit-password.dto';
import { EmailDto } from './dto/email.dto';
import { ProfileDto } from './dto/profile.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CurrentCarDto } from './dto/set-current-car.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { User, UserDocument } from './schemes/user.schema';
import { UserInfo } from './types/user-info';
import { UserHelper } from './user.helper';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly resendService: ResendService,
    private readonly passwordService: PasswordService,
    private readonly responseService: ResponseService,
    private readonly tokenService: TokenService,
    private readonly userRepository: UserRepository,
    private readonly userHelper: UserHelper,
    private readonly carHelper: CarHelper,
    private readonly carRepository: CarRepository,
  ) {}

  async activationEmail(activationToken: string): Promise<ApiResponse> {
    const user =
      await this.userRepository.findUserByActivationToken(activationToken);
    this.userHelper.isValidUser(user);

    const payload = { activationToken: null, isActivated: true };
    await this.userRepository.updateUser(user._id, payload);

    return this.responseService.createSuccessResponse(HttpStatus.OK);
  }

  async requestActivationEmailResend(dto: EmailDto): Promise<ApiResponse> {
    const user = await this.userRepository.findUserByEmail(dto.email);
    this.userHelper.isValidUser(user);

    const activationToken = v4();
    const payload = { activationToken, isActivated: false };
    const updatedUser = await this.userRepository.updateUser(user._id, payload);

    await this.resendService.sendConfirmEmailLetter(
      updatedUser.email,
      updatedUser.activationToken,
    );

    return this.responseService.createSuccessResponse(HttpStatus.OK);
  }

  async editProfile(
    userId: Types.ObjectId,
    dto: ProfileDto,
  ): Promise<ApiResponse<UserInfo>> {
    const user = await this.userRepository.findUserById(userId);
    this.userHelper.isValidUser(user);

    const updatedUser = await this.userRepository.updateUser(userId, dto);
    const safeUserData = this.userHelper.getSafeUserData(updatedUser);

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      safeUserData,
    );
  }

  async editEmail(
    userId: Types.ObjectId,
    dto: EmailDto,
  ): Promise<ApiResponse<UserInfo>> {
    const user = await this.userRepository.findUserById(userId);
    this.userHelper.isValidUser(user);

    const { email } = dto;
    await this.userHelper.validateUniqueEmail(email);

    const activationToken = v4();
    await this.resendService.sendConfirmEmailLetter(email, activationToken);

    const payload = { email, activationToken, isActivated: false };
    const updatedUser = await this.userRepository.updateUser(userId, payload);
    const safeUserData = this.userHelper.getSafeUserData(updatedUser);

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      safeUserData,
    );
  }

  async requestResetPassword(dto: EmailDto): Promise<ApiResponse> {
    const user = await this.userRepository.findUserByEmail(dto.email);
    this.userHelper.isValidUser(user);

    const resetToken = v4();
    await this.userRepository.updateUser(user._id, { resetToken });
    await this.resendService.sendPasswordResetEmail(user.email, resetToken);

    return this.responseService.createSuccessResponse(HttpStatus.OK);
  }

  async verifyResetToken(resetToken: string): Promise<ApiResponse> {
    const user = await this.userRepository.findUserByResetToken(resetToken);
    this.userHelper.isValidUser(user);

    return this.responseService.createSuccessResponse(HttpStatus.OK);
  }

  async resetPassword(
    dto: ResetPasswordDto,
    resetToken: string,
  ): Promise<ApiResponse> {
    const user = await this.userRepository.findUserByResetToken(resetToken);
    this.userHelper.isValidUser(user);

    const { password } = dto;
    const hashPassword = await this.passwordService.createPassword(password);

    const payload = { password: hashPassword, resetToken: null };
    await this.userRepository.updateUser(user._id, payload);

    await this.resendService.sendPasswordChangedSuccess(user.email);

    return this.responseService.createSuccessResponse(HttpStatus.OK);
  }

  async editPassword(
    dto: EditPasswordDto,
    userId: Types.ObjectId,
  ): Promise<ApiResponse> {
    const user = await this.userRepository.findUserById(userId);
    this.userHelper.isValidUser(user);

    await this.passwordService.validatePassword(dto.password, user.password);

    const { newPassword } = dto;
    const hashPassword = await this.passwordService.createPassword(newPassword);

    const payload = { password: hashPassword };
    await this.userRepository.updateUser(userId, payload);

    await this.resendService.sendPasswordChangedSuccess(user.email);

    return this.responseService.createSuccessResponse(HttpStatus.OK);
  }

  async getCurrentUser(userId: Types.ObjectId): Promise<ApiResponse<UserInfo>> {
    const user = await this.userRepository.findUserById(userId);
    this.userHelper.isValidUser(user);

    const safeUserData = this.userHelper.getSafeUserData(user);

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      safeUserData,
    );
  }

  async removeProfile(userId: Types.ObjectId): Promise<ApiResponse<UserInfo>> {
    const session = await this.userModel.db.startSession();
    session.startTransaction();

    try {
      const user = await this.userRepository.findUserById(userId);
      this.userHelper.isValidUser(user);

      const deletedUser = await this.userRepository.deleteUser(userId);
      await this.tokenService.deleteTokensByDb(new Types.ObjectId(userId));

      await session.commitTransaction();
      session.endSession();

      const safeUserData = this.userHelper.getSafeUserData(deletedUser);

      return this.responseService.createSuccessResponse(
        HttpStatus.OK,
        safeUserData,
      );
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw new AppError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message || 'Failed deleted user account.',
      );
    }
  }

  async setCurrentCar(
    userId: Types.ObjectId,
    dto: CurrentCarDto,
  ): Promise<ApiResponse<UserInfo>> {
    const user = await this.userRepository.findUserById(userId);
    this.userHelper.isValidUser(user);

    const carId = new Types.ObjectId(dto.carId);
    const car = await this.carRepository.findCarById(carId);
    this.carHelper.isValidCar(car);

    const payload = { currentCar: carId };
    const updatedUser = await this.userRepository.updateUser(userId, payload);
    const safeUserData = this.userHelper.getSafeUserData(updatedUser);

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      safeUserData,
    );
  }

  async setPassword(
    userId: Types.ObjectId,
    dto: SetPasswordDto,
  ): Promise<ApiResponse> {
    const user = await this.userRepository.findUserById(userId);
    this.userHelper.isValidUser(user);

    const { password } = dto;
    const hashPassword = await this.passwordService.createPassword(password);

    const payload = { password: hashPassword, isGoogleAuth: false };
    await this.userRepository.updateUser(user._id, payload);

    await this.resendService.sendPasswordChangedSuccess(user.email);

    return this.responseService.createSuccessResponse(HttpStatus.OK);
  }
}
