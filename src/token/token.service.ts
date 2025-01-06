import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserDocument } from 'src/user/schemes/user.schema.js';
import TokenType from './enums/token-type.enum.js';
import { Token, TokenDocument } from './schemas/token.schema';
import { Payload } from './types/payload.type';
import { Tokens } from './types/tokens.type';

@Injectable()
export class TokensService {
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

  async createTokens(payload: Payload): Promise<Tokens> {
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.ACCESS_TOKEN_KEY,
      expiresIn: process.env.ACCESS_TOKEN_TIME,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.REFRESH_TOKEN_KEY,
      expiresIn: process.env.REFRESH_TOKEN_TIME,
    });

    const owner = payload._id;
    const tokens = { accessToken, refreshToken };
    const tokensFromDb = await this.TokenModel.findOne({ owner });

    if (!tokensFromDb) {
      await this.TokenModel.create({ ...tokens, owner });
    }
    if (tokensFromDb) {
      await this.TokenModel.findByIdAndUpdate(tokensFromDb._id, { ...tokens });
    }

    return tokens;
  }

  checkToken(token: string, type: TokenType): Payload | null {
    let payload: Payload;

    if (type === TokenType.ACCESS) {
      payload = this.jwtService.verify(token, {
        secret: process.env.ACCESS_TOKEN_KEY,
      });
    } else if (type === TokenType.REFRESH) {
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
