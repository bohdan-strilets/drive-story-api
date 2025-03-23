import { HttpStatus, Injectable } from '@nestjs/common';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { UserHelper } from 'src/user/user.helper';
import { UserRepository } from 'src/user/user.repository';
import { AuthHelper } from './auth.helper';
import { AuthResponse } from './types/auth-response.type';

@Injectable()
export class GoogleService {
  constructor(
    private readonly responseService: ResponseService,
    private readonly authHelper: AuthHelper,
    private readonly userRepository: UserRepository,
    private readonly userHelper: UserHelper,
  ) {}

  async auth(googleIdToken: string): Promise<ApiResponse<AuthResponse>> {
    let isNewUser = false;

    const googlePayload =
      await this.authHelper.verifyGoogleToken(googleIdToken);

    const email = googlePayload.email;
    let user = await this.userRepository.findUserByEmail(email);
    this.userHelper.isValidUser(user);

    if (!user) {
      const payload = this.authHelper.createGooglePayload(googlePayload);
      user = await this.userRepository.createUser(payload);
      isNewUser = true;
    }

    const response = await this.authHelper.authResponse(user);

    return this.responseService.createSuccessResponse(
      isNewUser ? HttpStatus.CREATED : HttpStatus.OK,
      response,
    );
  }
}
