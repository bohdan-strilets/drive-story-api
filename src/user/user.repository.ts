import { HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages.helper';
import { getSafeUserData } from './helpers/get-safe-data';
import { User, UserDocument } from './schemes/user.schema';
import { UserInfo } from './types/user-info';

export class UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findUser(
    field: keyof UserDocument,
    value: string | Types.ObjectId,
  ): Promise<UserDocument> {
    const query: Record<string, any> = {};
    query[field] =
      field === '_id' && typeof value === 'string'
        ? new Types.ObjectId(value)
        : value;

    const user = await this.userModel.findOne(query);
    if (!user) {
      throw new AppError(HttpStatus.NOT_FOUND, errorMessages.USER_NOT_FOUND);
    }

    return user;
  }

  async setActivationStatus(
    userId: Types.ObjectId,
    activationToken: string | null = null,
    isActivated: boolean = true,
  ): Promise<UserDocument> {
    const options = { activationToken, isActivated };
    return await this.userModel.findByIdAndUpdate(userId, options, {
      new: true,
    });
  }

  async updateUserById(userId: Types.ObjectId, dto: any): Promise<UserInfo> {
    const updatedUser = await this.userModel.findByIdAndUpdate(userId, dto, {
      new: true,
    });
    return getSafeUserData(updatedUser);
  }

  async bindImage(
    userId: Types.ObjectId,
    data: Types.ObjectId | null,
    fieldName: 'avatars' | 'posters',
  ): Promise<UserDocument> {
    await this.findUser('_id', userId);
    return await this.userModel.findByIdAndUpdate(
      userId,
      { [fieldName]: data },
      { new: true },
    );
  }
}
