import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages.helper';
import { UserDocument } from 'src/user/schemes/user.schema';
import { TokenDocument } from './schemas/token.schema';
import { TokenRepository } from './token.repository';
import { Payload } from './types/payload.type';
import { TokenPair } from './types/token-pair.type';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private tokenRepository: TokenRepository,
  ) {}

  createPayload(user: UserDocument): Payload {
    const payload = {
      _id: user._id,
      email: user.email,
      isActivated: user.isActivated,
    };

    this.logger.debug(`Payload created for user ${user.email}`);
    return payload;
  }

  async createAccessToken(payload: Payload): Promise<string> {
    return this.jwtService.sign(payload, {
      secret: this.configService.get('ACCESS_TOKEN_KEY'),
      expiresIn: this.configService.get('ACCESS_TOKEN_TIME'),
    });
  }

  async createRefreshToken(payload: Payload): Promise<string> {
    return this.jwtService.sign(payload, {
      secret: this.configService.get('REFRESH_TOKEN_KEY'),
      expiresIn: this.configService.get('REFRESH_TOKEN_TIME'),
    });
  }

  async createTokenPair(payload: Payload): Promise<TokenPair> {
    const accessToken = await this.createAccessToken(payload);
    const refreshToken = await this.createRefreshToken(payload);

    const owner = payload._id;
    await this.tokenRepository.updateTokens(owner, { refreshToken });
    this.logger.debug(`Refresh token updated in DB for user ID ${payload._id}`);

    return { accessToken, refreshToken };
  }

  checkAccessToken(token: string) {
    return this.jwtService.verify(token, {
      secret: this.configService.get('ACCESS_TOKEN_KEY'),
    });
  }

  checkRefreshToken(token: string) {
    return this.jwtService.verify(token, {
      secret: this.configService.get('REFRESH_TOKEN_KEY'),
    });
  }

  async findTokenFromDb(userId: Types.ObjectId): Promise<TokenDocument> {
    const owner = new Types.ObjectId(userId);
    return await this.tokenRepository.findTokensByOwner(owner);
  }

  async deleteTokensByDb(userId: Types.ObjectId): Promise<void> {
    this.logger.log(`Deleting tokens for user ID ${userId}`);
    await this.tokenRepository.deleteTokens(userId);
  }

  async validateRefreshToken(refreshToken: string): Promise<Payload> {
    if (!refreshToken) {
      this.logger.error('No refresh token provided.');
      throw new AppError(
        HttpStatus.UNAUTHORIZED,
        errorMessages.UNAUTHORIZED_USER,
      );
    }

    const payload = this.checkRefreshToken(refreshToken);
    this.logger.debug(`Refresh token verified for user ID ${payload._id}`);

    const tokenFromDb = await this.findTokenFromDb(payload._id);
    if (!payload || !tokenFromDb) {
      this.logger.error(
        `Invalid refresh token or token not found in DB for user ID ${payload._id}`,
      );
      throw new AppError(
        HttpStatus.UNAUTHORIZED,
        errorMessages.UNAUTHORIZED_USER,
      );
    }

    return payload;
  }
}
