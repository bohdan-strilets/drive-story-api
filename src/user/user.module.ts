import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { PasswordModule } from 'src/password/password.module';
import { ResponseModule } from 'src/response/response.module';
import { SendgridModule } from 'src/sendgrid/sendgrid.module';
import { TokenModule } from 'src/token/token.module';
import { User, UserSchema } from './schemes/user.schema';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    SendgridModule,
    PasswordModule,
    CloudinaryModule,
    ResponseModule,
    TokenModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserRepository],
})
export class UserModule {}
