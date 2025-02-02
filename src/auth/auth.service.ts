import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { Model } from 'mongoose';
import { AppError } from 'src/error/app-error';
import { defaultImages } from 'src/helpers/default-images';
import { errorMessages } from 'src/helpers/error-messages';
import { sanitizeUserData } from 'src/helpers/sanitize-user-data';
import { PasswordService } from 'src/password/password.service';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { SendgridService } from 'src/sendgrid/sendgrid.service';
import TokenName from 'src/token/enums/token-name.enum';
import { TokenService } from 'src/token/token.service';
import { Payload } from 'src/token/types/payload.type';
import { User, UserDocument } from 'src/user/schemes/user.schema';
import { v4 } from 'uuid';
import { AuthDto } from './dto/auth.dto';
import { AuthResponse } from './types/auth-response.type';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly sendgridService: SendgridService,
    private readonly responseService: ResponseService,
  ) {}

  private async createUser(
    email: string,
    password: string,
  ): Promise<UserDocument> {
    const activationToken = v4();
    const hashPassword = await this.passwordService.createPassword(password);

    return this.userModel.create({
      email,
      activationToken,
      password: hashPassword,
      avatars: {
        default: defaultImages.USER_AVATAR,
        selected: defaultImages.USER_AVATAR,
      },
      posters: {
        default: defaultImages.USER_POSTER,
        selected: defaultImages.USER_POSTER,
      },
    });
  }

  private async sendActivationEmail(user: UserDocument): Promise<void> {
    await this.sendgridService.sendConfirmEmailLetter(
      user.email,
      user.activationToken,
    );
  }

  private async createAuthResponse(user: UserDocument): Promise<AuthResponse> {
    const payload = this.tokenService.createPayload(user);
    const tokens = await this.tokenService.createTokenPair(payload);
    const sanitizedUser = sanitizeUserData(user);

    return { user: sanitizedUser, tokens };
  }

  async registration(
    dto: AuthDto,
  ): Promise<ApiResponse<AuthResponse> | ApiResponse> {
    const { email, password } = dto;

    const userExists = await this.userModel.findOne({ email });

    if (userExists) {
      throw new AppError(HttpStatus.CONFLICT, errorMessages.EMAIL_IN_USE_ERROR);
    }

    const createdUser = await this.createUser(email, password);
    await this.sendActivationEmail(createdUser);

    const response = await this.createAuthResponse(createdUser);
    return this.responseService.createSuccessResponse<AuthResponse>(
      HttpStatus.CREATED,
      response,
    );
  }

  private async userValidation(
    user: UserDocument,
    password: string,
  ): Promise<void> {
    const isPasswordValid = await this.passwordService.checkPassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        errorMessages.INVALID_PASSWORD_ERROR,
      );
    }

    if (!user.isActivated) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        errorMessages.INVALID_PASSWORD_ERROR,
      );
    }
  }

  async login(dto: AuthDto): Promise<ApiResponse<AuthResponse> | ApiResponse> {
    const { email, password } = dto;
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        errorMessages.INVALID_EMAIL_ERROR,
      );
    }

    await this.userValidation(user, password);

    const response = await this.createAuthResponse(user);
    return this.responseService.createSuccessResponse<AuthResponse>(
      HttpStatus.OK,
      response,
    );
  }

  private async tokenValidation(refreshToken: string): Promise<Payload | void> {
    const payload = this.tokenService.checkToken(
      refreshToken,
      TokenName.REFRESH,
    );

    const tokenFromDb = await this.tokenService.findTokenFromDb(payload._id);

    if (!payload || !tokenFromDb) {
      throw new AppError(
        HttpStatus.UNAUTHORIZED,
        errorMessages.USER_NOT_AUTHORIZED,
      );
    }

    return payload;
  }

  async logout(refreshToken: string): Promise<ApiResponse> {
    if (!refreshToken) {
      throw new AppError(
        HttpStatus.UNAUTHORIZED,
        errorMessages.USER_NOT_AUTHORIZED,
      );
    }

    const payload = (await this.tokenValidation(refreshToken)) as Payload;
    await this.tokenService.deleteTokensByDb(payload._id);

    return this.responseService.createSuccessResponse(HttpStatus.OK);
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<ApiResponse<AuthResponse> | ApiResponse> {
    if (!refreshToken) {
      throw new AppError(
        HttpStatus.UNAUTHORIZED,
        errorMessages.USER_NOT_AUTHORIZED,
      );
    }

    const payload = (await this.tokenValidation(refreshToken)) as Payload;
    const userExists = await this.userModel.findById(payload._id);

    if (!userExists) {
      throw new AppError(HttpStatus.NOT_FOUND, errorMessages.USER_NOT_FOUND);
    }

    const response = await this.createAuthResponse(userExists);
    return this.responseService.createSuccessResponse<AuthResponse>(
      HttpStatus.CREATED,
      response,
    );
  }

  private async verifyGoogleToken(token: string): Promise<TokenPayload | null> {
    try {
      const client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
      );

      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      return ticket.getPayload();
    } catch (error) {
      console.warn('Invalid Google token:', error);
      return null;
    }
  }

  private async createNewUserFromGooglePayload(
    googlePayload: TokenPayload,
  ): Promise<UserDocument> {
    const userDto = {
      email: googlePayload.email,
      isActivated: googlePayload.email_verified,
      avatars: {
        default: defaultImages.USER_AVATAR,
        selected: defaultImages.USER_AVATAR,
      },
      posters: {
        default: defaultImages.USER_POSTER,
        selected: defaultImages.USER_POSTER,
      },
    };

    return this.userModel.create({ ...userDto });
  }

  async googleAuth(
    token: string,
  ): Promise<ApiResponse<AuthResponse> | ApiResponse> {
    const googlePayload = await this.verifyGoogleToken(token);
    if (!googlePayload || !googlePayload.email) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        errorMessages.INVALID_GOOGLE_TOKEN,
      );
    }

    const email = googlePayload.email;
    const user = await this.userModel.findOne({ email });

    if (!user) {
      await this.createNewUserFromGooglePayload(googlePayload);
    }

    const payload = this.tokenService.createPayload(user);
    const tokens = await this.tokenService.createTokenPair(payload);
    const response = { user: sanitizeUserData(user), tokens };

    return this.responseService.createSuccessResponse(
      user.isNew ? HttpStatus.CREATED : HttpStatus.OK,
      response,
    );
  }
}
