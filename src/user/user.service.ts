import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiResponse } from 'src/helpers/api-response.type';
import { errorMessages } from 'src/helpers/error-messages';
import { SendgridService } from 'src/sendgrid/sendgrid.service';
import { v4 } from 'uuid';
import { EmailDto } from './dto/email.dto';
import { User } from './schemes/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly sendgridService: SendgridService,
  ) {}

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

  async requestActivationEmailResend(dto: EmailDto): Promise<ApiResponse> {
    const { email } = dto;
    const user = await this.userModel.findOne({ email });
    const activationToken = v4();

    if (!user) {
      return {
        success: false,
        statusCode: HttpStatus.NOT_FOUND,
        message: errorMessages.USER_NOT_FOUND,
      };
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(
      user._id,
      {
        isActivated: false,
        activationToken,
      },
      { new: true },
    );

    await this.sendgridService.sendConfirmEmailLetter(
      updatedUser.email,
      updatedUser.activationToken,
    );

    return {
      success: true,
      statusCode: HttpStatus.OK,
    };
  }
}
