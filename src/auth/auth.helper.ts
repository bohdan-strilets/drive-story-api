import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginTicket, OAuth2Client, TokenPayload } from 'google-auth-library';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages.helper';
import { TokenService } from 'src/token/token.service';
import { UserDocument } from 'src/user/schemes/user.schema';
import { UserHelper } from 'src/user/user.helper';
import { AuthResponse } from './types/auth-response.type';

@Injectable()
export class AuthHelper {
  private googleClient: OAuth2Client;
  private readonly logger = new Logger(AuthHelper.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
    private readonly userHelper: UserHelper,
  ) {
    const clientId = this.configService.get('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');
    this.googleClient = new OAuth2Client(clientId, clientSecret);
  }

  async authResponse(user: UserDocument): Promise<AuthResponse> {
    const tokenPayload = this.tokenService.createPayload(user);
    const tokens = await this.tokenService.createTokenPair(tokenPayload);

    const safeData = this.userHelper.getSafeUserData(user);
    return { user: safeData, tokens };
  }

  async createGoogleTicket(googleIdToken: string): Promise<LoginTicket> {
    const ticket = await this.googleClient.verifyIdToken({
      idToken: googleIdToken,
      audience: this.configService.get('GOOGLE_CLIENT_ID'),
    });

    this.logger.debug('Google ID token verified.');
    return ticket;
  }

  async verifyGoogleToken(googleIdToken: string): Promise<TokenPayload> {
    try {
      const ticket = await this.createGoogleTicket(googleIdToken);

      if (!ticket) {
        this.logger.error(errorMessages.INVALID_GOOGLE_TOKEN);
        throw new AppError(
          HttpStatus.BAD_REQUEST,
          errorMessages.INVALID_GOOGLE_TOKEN,
        );
      }

      return ticket.getPayload();
    } catch (error) {
      this.logger.error('Error verifying Google token', error.stack);
      throw new AppError(HttpStatus.INTERNAL_SERVER_ERROR, error);
    }
  }

  createGooglePayload(googlePayload: TokenPayload) {
    return {
      firstName: googlePayload.given_name,
      lastName: googlePayload.family_name,
      nickname: googlePayload.name,
      email: googlePayload.email,
      isActivated: googlePayload.email_verified,
    };
  }
}
