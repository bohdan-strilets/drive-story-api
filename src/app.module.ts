import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AccessoryModule } from './accessory/accessory.module';
import { AuthModule } from './auth/auth.module';
import { CarModule } from './car/car.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ContactModule } from './contact/contact.module';
import { FuelingModule } from './fueling/fueling.module';
import { ImageModule } from './image/image.module';
import { InspectionModule } from './inspection/inspection.module';
import { InsuranceModule } from './insurance/insurance.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { PasswordModule } from './password/password.module';
import { PushModule } from './push/push.module';
import { ReminderModule } from './reminder/reminder.module';
import { ResponseModule } from './response/response.module';
import { SendgridModule } from './sendgrid/sendgrid.module';
import { TokenModule } from './token/token.module';
import { UserModule } from './user/user.module';
import { PaginationModule } from './pagination/pagination.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URL),
    ScheduleModule.forRoot(),
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
    InspectionModule,
    ReminderModule,
    PushModule,
    PaginationModule,
  ],
})
export class AppModule {}
