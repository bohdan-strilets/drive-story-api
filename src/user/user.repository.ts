import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemes/user.schema';

export class UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findUserByActivationToken(
    activationToken: string,
  ): Promise<UserDocument> {
    return this.userModel
      .findOne({ activationToken })
      .populate('avatars')
      .populate('posters');
  }

  async findUserByResetToken(resetToken: string): Promise<UserDocument> {
    return this.userModel
      .findOne({ resetToken })
      .populate('avatars')
      .populate('posters');
  }

  async findUserByEmail(email: string): Promise<UserDocument> {
    return this.userModel
      .findOne({ email })
      .populate('avatars')
      .populate('posters');
  }

  async findUserById(userId: Types.ObjectId): Promise<UserDocument> {
    return this.userModel
      .findById(userId)
      .populate('avatars')
      .populate('posters');
  }

  async createUser(payload: any): Promise<UserDocument> {
    return this.userModel.create(payload);
  }

  async updateUser(userId: Types.ObjectId, dto: any): Promise<UserDocument> {
    return this.userModel
      .findByIdAndUpdate(userId, dto, { new: true })
      .populate('avatars')
      .populate('posters');
  }

  async deleteUser(userId: Types.ObjectId) {
    return this.userModel
      .findByIdAndDelete(userId)
      .populate('avatars')
      .populate('posters');
  }

  async setImage(
    userId: Types.ObjectId,
    data: Types.ObjectId | null,
    fieldName: 'avatars' | 'posters',
  ): Promise<UserDocument> {
    return this.updateUser(userId, { [fieldName]: data });
  }
}
