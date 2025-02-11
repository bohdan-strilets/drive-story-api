import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { AccessoryModule } from './accessory/accessory.module';
import { AuthModule } from './auth/auth.module';
import { CarModule } from './car/car.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ContactModule } from './contact/contact.module';
import { HttpExceptionFilter } from './error/http-exception.filter';
import { FuelingModule } from './fueling/fueling.module';
import { ImageModule } from './image/image.module';
import { InsuranceModule } from './insurance/insurance.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { PasswordModule } from './password/password.module';
import { ResponseModule } from './response/response.module';
import { ResponseService } from './response/response.service';
import { SendgridModule } from './sendgrid/sendgrid.module';
import { TokenModule } from './token/token.module';
import { UserModule } from './user/user.module';

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
    MaintenanceModule,
    ImageModule,
    FuelingModule,
    AccessoryModule,
    ContactModule,
    InsuranceModule,
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
