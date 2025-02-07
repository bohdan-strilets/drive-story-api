import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages.helper';
import { UserDocument } from 'src/user/schemes/user.schema';
import TokenName from './enums/token-name.enum';
import { Token, TokenDocument } from './schemas/token.schema';
import { Payload } from './types/payload.type';
import { TokenPair } from './types/token-pair.type';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  createPayload(user: UserDocument): Payload {
    return {
      _id: user._id,
      email: user.email,
      isActivated: user.isActivated,
    };
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

    await this.tokenModel.findOneAndUpdate(
      { owner },
      { refreshToken },
      { upsert: true, new: true },
    );

    return { accessToken, refreshToken };
  }

  checkToken(token: string, type: TokenName): Payload | null {
    try {
      if (type === TokenName.ACCESS) {
        return this.jwtService.verify(token, {
          secret: process.env.ACCESS_TOKEN_KEY,
        });
      } else if (type === TokenName.REFRESH) {
        return this.jwtService.verify(token, {
          secret: process.env.REFRESH_TOKEN_KEY,
        });
      }
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  async findTokenFromDb(userId: Types.ObjectId): Promise<TokenDocument | null> {
    const owner = new Types.ObjectId(userId);
    const tokens = await this.tokenModel.findOne({ owner });

    if (tokens) {
      return tokens;
    }

    return null;
  }

  async deleteTokensByDb(userId: Types.ObjectId): Promise<void> {
    await this.tokenModel.findOneAndDelete({ owner: userId });
  }

  async validateRefreshToken(refreshToken: string): Promise<Payload> {
    if (!refreshToken) {
      throw new AppError(
        HttpStatus.UNAUTHORIZED,
        errorMessages.UNAUTHORIZED_USER,
      );
    }

    const payload = this.checkToken(refreshToken, TokenName.REFRESH);
    const tokenFromDb = await this.findTokenFromDb(payload._id);

    if (!payload || !tokenFromDb) {
      throw new AppError(
        HttpStatus.UNAUTHORIZED,
        errorMessages.UNAUTHORIZED_USER,
      );
    }

    return payload;
  }
}
