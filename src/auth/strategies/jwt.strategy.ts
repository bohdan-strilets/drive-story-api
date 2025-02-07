import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Types } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages.helper';
import { Payload } from 'src/token/types/payload.type';
import { UserDocument } from 'src/user/schemes/user.schema';
import { UserRepository } from 'src/user/user.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
  ) {
    const accessSecretKey = configService.get<string>('ACCESS_TOKEN_KEY');

    if (!accessSecretKey) {
      throw new AppError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessages.INVALID_TOKEN,
      );
    }

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
    const user = await this.userRepository.findById(new Types.ObjectId(_id));
    return user;
  }
}
