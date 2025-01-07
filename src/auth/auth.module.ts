import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PasswordModule } from 'src/password/password.module';
import { SendgridModule } from 'src/sendgrid/sendgrid.module';
import { TokenModule } from 'src/token/token.module';
import { User, UserSchema } from 'src/user/schemes/user.schema';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PasswordModule,
    TokenModule,
    SendgridModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
