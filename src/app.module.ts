import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { CarModule } from './car/car.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { HttpExceptionFilter } from './error/http-exception.filter';
import { PasswordModule } from './password/password.module';
import { ResponseModule } from './response/response.module';
import { ResponseService } from './response/response.service';
import { SendgridModule } from './sendgrid/sendgrid.module';
import { TokenModule } from './token/token.module';
import { UserModule } from './user/user.module';
import { ServiceModule } from './service/service.module';

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
    ServiceModule,
  ],
  providers: [
    ResponseService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
