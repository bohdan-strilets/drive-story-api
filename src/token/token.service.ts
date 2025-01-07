import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserDocument } from 'src/user/schemes/user.schema.js';
import TokenName from './enums/token-name.enum.js';
import { Token, TokenDocument } from './schemas/token.schema';
import { Payload } from './types/payload.type';
import { Tokens } from './types/tokens.type';

@Injectable()
export class TokenService {
  constructor(
    @InjectModel(Token.name) private TokenModel: Model<TokenDocument>,
    private jwtService: JwtService,
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
      secret: process.env.ACCESS_TOKEN_KEY,
      expiresIn: process.env.ACCESS_TOKEN_TIME,
    });
  }

  async createRefreshToken(payload: Payload): Promise<string> {
    return this.jwtService.sign(payload, {
      secret: process.env.REFRESH_TOKEN_KEY,
      expiresIn: process.env.REFRESH_TOKEN_TIME,
    });
  }

  async createTokenPair(payload: Payload): Promise<Tokens> {
    const accessToken = await this.createAccessToken(payload);
    const refreshToken = await this.createRefreshToken(payload);

    const owner = payload._id;
    const tokensFromDb = await this.TokenModel.findOne({ owner });

    if (!tokensFromDb) {
      await this.TokenModel.create({ refreshToken, owner });
    }
    if (tokensFromDb) {
      await this.TokenModel.findByIdAndUpdate(tokensFromDb._id, {
        refreshToken,
      });
    }

    return { accessToken, refreshToken };
  }

  checkToken(token: string, type: TokenName): Payload | null {
    let payload: Payload;

    if (type === TokenName.ACCESS) {
      payload = this.jwtService.verify(token, {
        secret: process.env.ACCESS_TOKEN_KEY,
      });
    } else if (type === TokenName.REFRESH) {
      payload = this.jwtService.verify(token, {
        secret: process.env.REFRESH_TOKEN_KEY,
      });
    }

    if (payload) {
      return payload;
    } else {
      return null;
    }
  }

  async findTokenFromDb(userId: Types.ObjectId): Promise<TokenDocument | null> {
    const tokens = await this.TokenModel.findOne({ owner: userId });

    if (tokens) {
      return tokens;
    }

    return null;
  }

  async deleteTokensByDb(userId: Types.ObjectId): Promise<void> {
    await this.TokenModel.findOneAndDelete({ owner: userId });
  }
}
