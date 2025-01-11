import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { OAuth2Client } from 'google-auth-library';
import { Model } from 'mongoose';
import { ApiResponse } from 'src/helpers/api-response.type';
import { defaultImages } from 'src/helpers/default-images';
import { errorMessages } from 'src/helpers/error-messages';
import { sanitizeUserData } from 'src/helpers/sanitize-user-data';
import { PasswordService } from 'src/password/password.service';
import { SendgridService } from 'src/sendgrid/sendgrid.service';
import TokenName from 'src/token/enums/token-name.enum';
import { TokenService } from 'src/token/token.service';
import { User } from 'src/user/schemes/user.schema';
import { v4 } from 'uuid';
import { AuthDto } from './dto/auth.dto';
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
    dto: AuthDto,
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
      avatars: {
        default: defaultImages.USER_AVATAR,
        selected: defaultImages.USER_AVATAR,
      },
      posters: {
        default: defaultImages.USER_POSTER,
        selected: defaultImages.USER_POSTER,
      },
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

  async login(dto: AuthDto): Promise<ApiResponse<AuthResponse> | ApiResponse> {
    const { email, password } = dto;
    const user = await this.userModel.findOne({ email });

    if (!user) {
      return {
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: errorMessages.INVALID_EMAIL_ERROR,
      };
    }

    const checkPassword = await this.passwordService.checkPassword(
      password,
      user.password,
    );

    if (!checkPassword) {
      return {
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: errorMessages.INVALID_PASSWORD_ERROR,
      };
    }

    if (!user.isActivated) {
      return {
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: errorMessages.INACTIVE_EMAIL_ERROR,
      };
    }

    const payload = this.tokenService.createPayload(user);
    const tokens = await this.tokenService.createTokenPair(payload);
    const userInfo = sanitizeUserData(user);

    return {
      success: true,
      statusCode: HttpStatus.OK,
      data: { user: userInfo, tokens },
    };
  }

  async logout(refreshToken: string): Promise<ApiResponse> {
    if (!refreshToken) {
      return {
        success: false,
        statusCode: HttpStatus.UNAUTHORIZED,
        message: errorMessages.USER_NOT_AUTHORIZED,
      };
    }

    const payload = this.tokenService.checkToken(
      refreshToken,
      TokenName.REFRESH,
    );
    const tokenFromDb = await this.tokenService.findTokenFromDb(payload._id);

    if (!payload || !tokenFromDb) {
      return {
        success: false,
        statusCode: HttpStatus.UNAUTHORIZED,
        message: errorMessages.USER_NOT_AUTHORIZED,
      };
    }

    await this.tokenService.deleteTokensByDb(payload._id);

    return {
      success: true,
      statusCode: HttpStatus.OK,
    };
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<ApiResponse<AuthResponse> | ApiResponse> {
    if (!refreshToken) {
      return {
        success: false,
        statusCode: HttpStatus.UNAUTHORIZED,
        message: errorMessages.USER_NOT_AUTHORIZED,
      };
    }

    const payload = this.tokenService.checkToken(
      refreshToken,
      TokenName.REFRESH,
    );
    const tokenFromDb = await this.tokenService.findTokenFromDb(payload._id);

    if (!payload || !tokenFromDb) {
      return {
        success: false,
        statusCode: HttpStatus.UNAUTHORIZED,
        message: errorMessages.USER_NOT_AUTHORIZED,
      };
    }

    const userFromDb = await this.userModel.findById(payload._id);

    if (!userFromDb) {
      return {
        success: false,
        statusCode: HttpStatus.NOT_FOUND,
        message: errorMessages.USER_NOT_FOUND,
      };
    }

    const newPayload = this.tokenService.createPayload(userFromDb);
    const tokens = await this.tokenService.createTokenPair(newPayload);
    const userInfo = sanitizeUserData(userFromDb);

    return {
      success: true,
      statusCode: HttpStatus.OK,
      data: { user: userInfo, tokens },
    };
  }

  async googleAuth(
    token: string,
  ): Promise<ApiResponse<AuthResponse> | ApiResponse> {
    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    );

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const googlePayload = ticket.getPayload();

    const email = googlePayload.email;
    const userFromDB = await this.userModel.findOne({ email });

    if (userFromDB) {
      const payload = this.tokenService.createPayload(userFromDB);
      const tokens = await this.tokenService.createTokenPair(payload);
      const userInfo = sanitizeUserData(userFromDB);

      return {
        success: true,
        statusCode: HttpStatus.OK,
        data: { user: userInfo, tokens },
      };
    } else {
      const userDto = {
        email,
        isActivated: googlePayload.email_verified,
        avatars: {
          default: defaultImages.USER_AVATAR,
          selected: defaultImages.USER_AVATAR,
        },
        posters: {
          default: defaultImages.USER_POSTER,
          selected: defaultImages.USER_POSTER,
        },
      };

      const newUser = await this.userModel.create({ ...userDto });
      const payload = this.tokenService.createPayload(newUser);
      const tokens = await this.tokenService.createTokenPair(payload);
      const userInfo = sanitizeUserData(newUser);

      return {
        success: true,
        statusCode: HttpStatus.CREATED,
        data: { user: userInfo, tokens },
      };
    }
  }
}
