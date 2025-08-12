import { HttpStatus, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { PasswordService } from 'src/password/password.service';
import { ResendService } from 'src/resend/resend.service';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { TokenService } from 'src/token/token.service';
import { UserHelper } from 'src/user/user.helper';
import { UserRepository } from 'src/user/user.repository';
import { v4 } from 'uuid';
import { AuthHelper } from './auth.helper';
import { LoginDto } from './dto/login.dto';
import { RegistrationDto } from './dto/registration.dto';
import { AuthResponse } from './types/auth-response.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly responseService: ResponseService,
    private readonly userRepository: UserRepository,
    private readonly userHelper: UserHelper,
    private readonly passwordService: PasswordService,
    private readonly resendService: ResendService,
    private readonly authHelper: AuthHelper,
  ) {}

  async registration(dto: RegistrationDto): Promise<ApiResponse<AuthResponse>> {
    const { email, password, firstName, lastName } = dto;
    await this.userHelper.validateUniqueEmail(email);

    const activationToken = v4();
    const hashPassword = await this.passwordService.createPassword(password);
    const payload = {
      firstName,
      lastName,
      email,
      activationToken,
      password: hashPassword,
    };

    const user = await this.userRepository.createUser(payload);

    await this.resendService.sendConfirmEmailLetter(email, activationToken);

    const response = await this.authHelper.authResponse(user);

    return this.responseService.createSuccessResponse(
      HttpStatus.CREATED,
      response,
    );
  }

  async login(dto: LoginDto): Promise<ApiResponse<AuthResponse>> {
    const { email, password } = dto;
    const user = await this.userRepository.findUserByEmail(email);

    this.userHelper.isValidUser(user);
    await this.passwordService.validatePassword(password, user.password);
    this.userHelper.validateUserActivation(user.isActivated);

    const response = await this.authHelper.authResponse(user);

    return this.responseService.createSuccessResponse(HttpStatus.OK, response);
  }

  async logout(refreshToken: string): Promise<ApiResponse> {
    const payload = await this.tokenService.validateRefreshToken(refreshToken);
    await this.tokenService.deleteTokensByDb(payload._id);

    return this.responseService.createSuccessResponse(HttpStatus.OK);
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
    const payload = await this.tokenService.validateRefreshToken(refreshToken);
    const userId = new Types.ObjectId(payload._id);

    const user = await this.userRepository.findUserById(userId);
    this.userHelper.isValidUser(user);

    const response = await this.authHelper.authResponse(user);

    return this.responseService.createSuccessResponse(
      HttpStatus.CREATED,
      response,
    );
  }
}
