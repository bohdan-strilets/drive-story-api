import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SendgridModule } from 'src/sendgrid/sendgrid.module';
import { User, UserSchema } from './schemes/user.schema';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    SendgridModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
