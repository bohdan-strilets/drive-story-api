import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Types } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages.helper';
import { Payload } from 'src/token/types/payload.type';
import { UserDocument } from 'src/user/schemes/user.schema';
import { UserHelper } from 'src/user/user.helper';
import { UserRepository } from 'src/user/user.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly userRepository: UserRepository,
    private readonly userHelper: UserHelper,
  ) {
    const accessSecretKey = configService.get('ACCESS_TOKEN_KEY');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: accessSecretKey,
    });
  }

  async validate(payload: Payload): Promise<UserDocument> {
    if (!payload) {
      throw new AppError(HttpStatus.UNAUTHORIZED, errorMessages.INVALID_TOKEN);
    }

    const { _id } = payload;
    const user = await this.userRepository.findUserById(
      new Types.ObjectId(_id),
    );
    this.userHelper.isValidUser(user);

    return user;
  }
}
