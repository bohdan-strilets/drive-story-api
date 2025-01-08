import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiResponse } from 'src/helpers/api-response.type';
import { errorMessages } from 'src/helpers/error-messages';
import { User } from './schemes/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async activationEmail(activationToken: string): Promise<ApiResponse> {
    const user = await this.userModel.findOne({ activationToken });

    if (!user) {
      return {
        success: false,
        statusCode: HttpStatus.NOT_FOUND,
        message: errorMessages.ACTIVATION_TOKEN_ERROR,
      };
    }

    const options = { activationToken: null, isActivated: true };
    await this.userModel.findByIdAndUpdate(user._id, options);

    return {
      success: true,
      statusCode: HttpStatus.OK,
    };
  }
}
