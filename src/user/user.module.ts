import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CarModule } from 'src/car/car.module';
import { PasswordModule } from 'src/password/password.module';
import { ResendModule } from 'src/resend/resend.module';
import { ResponseModule } from 'src/response/response.module';
import { TokenModule } from 'src/token/token.module';
import { User, UserSchema } from './schemes/user.schema';
import { UserController } from './user.controller';
import { UserHelper } from './user.helper';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ResendModule,
    PasswordModule,
    ResponseModule,
    TokenModule,
    CarModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository, UserHelper],
  exports: [UserRepository, UserHelper],
})
export class UserModule {}
