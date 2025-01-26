import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { Model, Types } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User, UserDocument } from 'src/user/schemes/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('ACCESS_TOKEN_KEY'),
    });
  }

  async validate(payload: Pick<UserDocument, '_id'>) {
    const { _id } = payload;

    if (!payload || !_id) {
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.userModel.findById(new Types.ObjectId(_id));

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
