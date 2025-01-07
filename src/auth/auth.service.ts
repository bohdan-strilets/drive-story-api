import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiResponse } from 'src/helpers/api-response.type';
import { errorMessages } from 'src/helpers/error-messages';
import { sanitizeUserData } from 'src/helpers/sanitize-user-data';
import { PasswordService } from 'src/password/password.service';
import { SendgridService } from 'src/sendgrid/sendgrid.service';
import { TokenService } from 'src/token/token.service';
import { User } from 'src/user/schemes/user.schema';
import { v4 } from 'uuid';
import { RegistrationDto } from './dto/registration.dto';
import { AuthResponse } from './types/auth-response.type';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly sendgridService: SendgridService,
  ) {}

  async registration(
    dto: RegistrationDto,
  ): Promise<ApiResponse<AuthResponse> | ApiResponse> {
    const { email, password } = dto;
    const userFromDb = await this.userModel.findOne({ email });

    if (userFromDb) {
      return {
        success: false,
        statusCode: HttpStatus.CONFLICT,
        message: errorMessages.EMAIL_IN_USE_ERROR,
      };
    }

    const activationToken = v4();
    const hashPassword = await this.passwordService.createPassword(password);

    const createdUser = await this.userModel.create({
      email,
      activationToken,
      password: hashPassword,
    });

    await this.sendgridService.sendConfirmEmailLetter(
      createdUser.email,
      createdUser.activationToken,
    );

    const payload = this.tokenService.createPayload(createdUser);
    const tokens = await this.tokenService.createTokenPair(payload);
    const userInfo = sanitizeUserData(createdUser);

    return {
      success: true,
      statusCode: HttpStatus.CREATED,
      data: { user: userInfo, tokens },
    };
  }
}
