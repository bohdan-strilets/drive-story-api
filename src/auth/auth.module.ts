import { Module } from '@nestjs/common';
import { PasswordModule } from 'src/password/password.module';
import { ResponseModule } from 'src/response/response.module';
import { SendgridModule } from 'src/sendgrid/sendgrid.module';
import { TokenModule } from 'src/token/token.module';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthHelper } from './auth.helper';
import { AuthService } from './auth.service';
import { GoogleService } from './google.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PasswordModule,
    TokenModule,
    SendgridModule,
    ResponseModule,
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleService, AuthHelper],
})
export class AuthModule {}
