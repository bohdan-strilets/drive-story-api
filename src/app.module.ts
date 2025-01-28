import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { PasswordModule } from './password/password.module';
import { ResponseModule } from './response/response.module';
import { SendgridModule } from './sendgrid/sendgrid.module';
import { TokenModule } from './token/token.module';
import { UserModule } from './user/user.module';
import { CarModule } from './car/car.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URL),
    UserModule,
    AuthModule,
    PasswordModule,
    TokenModule,
    SendgridModule,
    CloudinaryModule,
    ResponseModule,
    CarModule,
  ],
})
export class AppModule {}
