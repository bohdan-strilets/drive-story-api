import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PasswordModule } from 'src/password/password.module';
import { ResponseModule } from 'src/response/response.module';
import { SendgridModule } from 'src/sendgrid/sendgrid.module';
import { TokenModule } from 'src/token/token.module';
import { User, UserSchema } from './schemes/user.schema';
import { UserController } from './user.controller';
import { UserHelper } from './user.helper';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    SendgridModule,
    PasswordModule,
    ResponseModule,
    TokenModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository, UserHelper],
  exports: [UserRepository, UserHelper],
})
export class UserModule {}
