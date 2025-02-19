import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Token, TokenDocument } from './schemas/token.schema';

export class TokenRepository {
  constructor(
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
  ) {}

  async findTokensByOwner(owner: Types.ObjectId): Promise<TokenDocument> {
    return this.tokenModel.findOne({ owner });
  }

  async updateTokens(owner: Types.ObjectId, dto: any): Promise<TokenDocument> {
    return this.tokenModel.findOneAndUpdate({ owner }, dto, {
      upsert: true,
      new: true,
    });
  }

  async deleteTokens(owner: Types.ObjectId) {
    return this.tokenModel.findOneAndDelete({ owner });
  }
}
