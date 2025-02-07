import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages.helper';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { TokenService } from 'src/token/token.service';
import { User, UserDocument } from 'src/user/schemes/user.schema';
import { AuthRepository } from './auth.repository';
import { AuthDto } from './dto/auth.dto';
import { AuthResponse } from './types/auth-response.type';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly tokenService: TokenService,
    private readonly responseService: ResponseService,
    private readonly authRepository: AuthRepository,
  ) {}

  async registration(dto: AuthDto): Promise<ApiResponse<AuthResponse>> {
    const { email, password } = dto;
    this.authRepository.validateUniqueEmail(email);

    const createdUser = await this.authRepository.createUser(email, password);
    await this.authRepository.sendActivationEmail(createdUser);

    const response = await this.authRepository.createAuthResponse(createdUser);
    return this.responseService.createSuccessResponse<AuthResponse>(
      HttpStatus.CREATED,
      response,
    );
  }

  async login(dto: AuthDto): Promise<ApiResponse<AuthResponse>> {
    const { email, password } = dto;
    const user = await this.userModel.findOne({ email });

    await this.authRepository.validateUser(user, password);

    const response = await this.authRepository.createAuthResponse(user);
    return this.responseService.createSuccessResponse<AuthResponse>(
      HttpStatus.OK,
      response,
    );
  }

  async logout(refreshToken: string): Promise<ApiResponse> {
    const payload = await this.tokenService.validateRefreshToken(refreshToken);

    await this.tokenService.deleteTokensByDb(payload._id);
    return this.responseService.createSuccessResponse(HttpStatus.OK);
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
    const payload = await this.tokenService.validateRefreshToken(refreshToken);
    const userExists = await this.userModel.findById(payload._id);

    if (!userExists) {
      throw new AppError(HttpStatus.NOT_FOUND, errorMessages.USER_NOT_FOUND);
    }

    const response = await this.authRepository.createAuthResponse(userExists);
    return this.responseService.createSuccessResponse<AuthResponse>(
      HttpStatus.CREATED,
      response,
    );
  }
}
