import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { LoginTicket, OAuth2Client, TokenPayload } from 'google-auth-library';
import { Document, Model } from 'mongoose';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages.helper';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { User, UserDocument } from 'src/user/schemes/user.schema';
import { AuthRepository } from './auth.repository';
import { AuthResponse } from './types/auth-response.type';

export class GoogleService {
  private googleClient: OAuth2Client;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly responseService: ResponseService,
    private readonly configService: ConfigService,
    private readonly authRepository: AuthRepository,
  ) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new AppError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessages.MISSING_GOOGLE_CREDENTIALS,
      );
    }

    this.googleClient = new OAuth2Client(clientId, clientSecret);
  }

  private async createGoogleTicket(
    googleIdToken: string,
  ): Promise<LoginTicket> {
    return await this.googleClient.verifyIdToken({
      idToken: googleIdToken,
      audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
    });
  }

  private async verifyGoogleToken(
    googleIdToken: string,
  ): Promise<TokenPayload> {
    try {
      const ticket = await this.createGoogleTicket(googleIdToken);

      if (!ticket) {
        throw new AppError(
          HttpStatus.BAD_REQUEST,
          errorMessages.INVALID_GOOGLE_TOKEN,
        );
      }

      return ticket.getPayload();
    } catch (error) {
      const code =
        (error.httpStatus as number) || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message || errorMessages.INVALID_GOOGLE_TOKEN;
      throw new AppError(code, message);
    }
  }

  private async createUserFromGooglePayload(
    googlePayload: TokenPayload,
  ): Promise<UserDocument & Document> {
    const googleUserData = {
      firstName: googlePayload.given_name,
      lastName: googlePayload.family_name,
      nickname: googlePayload.name,
      email: googlePayload.email,
      isActivated: googlePayload.email_verified,
    };

    return this.userModel.create({ ...googleUserData });
  }

  async auth(googleIdToken: string): Promise<ApiResponse<AuthResponse>> {
    let isNewUser = false;
    const googlePayload = await this.verifyGoogleToken(googleIdToken);

    const email = googlePayload.email;
    let user = await this.userModel.findOne({ email });

    if (!user) {
      user = await this.createUserFromGooglePayload(googlePayload);
      isNewUser = true;
    }

    const response = await this.authRepository.createAuthResponse(user);
    return this.responseService.createSuccessResponse(
      isNewUser ? HttpStatus.CREATED : HttpStatus.OK,
      response,
    );
  }
}
