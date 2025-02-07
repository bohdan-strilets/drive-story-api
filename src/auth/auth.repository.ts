import { HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages.helper';
import { PasswordService } from 'src/password/password.service';
import { SendgridService } from 'src/sendgrid/sendgrid.service';
import { TokenService } from 'src/token/token.service';
import { getSafeUserData } from 'src/user/helpers/get-safe-data';
import { User, UserDocument } from 'src/user/schemes/user.schema';
import { v4 } from 'uuid';
import { AuthResponse } from './types/auth-response.type';

export class AuthRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly sendgridService: SendgridService,
  ) {}

  async createUser(email: string, password: string): Promise<UserDocument> {
    const activationToken = v4();
    const hashPassword = await this.passwordService.createPassword(password);

    return this.userModel.create({
      email,
      activationToken,
      password: hashPassword,
    });
  }

  async sendActivationEmail(user: UserDocument): Promise<void> {
    await this.sendgridService.sendConfirmEmailLetter(
      user.email,
      user.activationToken,
    );
  }

  async createAuthResponse(user: UserDocument): Promise<AuthResponse> {
    const payload = this.tokenService.createPayload(user);
    const tokens = await this.tokenService.createTokenPair(payload);
    const safeData = getSafeUserData(user);

    return { user: safeData, tokens };
  }

  async validateUser(user: UserDocument, password: string): Promise<void> {
    if (!user) {
      throw new AppError(HttpStatus.BAD_REQUEST, errorMessages.INVALID_EMAIL);
    }

    await this.passwordService.validatePassword(password, user.password);

    if (!user.isActivated) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        errorMessages.EMAIL_NOT_ACTIVATED,
      );
    }
  }

  async validateUniqueEmail(email: string): Promise<void> {
    const user = await this.userModel.findOne({ email });

    if (user) {
      throw new AppError(HttpStatus.CONFLICT, errorMessages.EMAIL_EXISTS);
    }
  }
}
