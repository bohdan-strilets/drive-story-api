import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CarModule } from 'src/car/car.module';
import { ContactModule } from 'src/contact/contact.module';
import { ResponseModule } from 'src/response/response.module';
import { AccessoryController } from './accessory.controller';
import { AccessoryRepository } from './accessory.repository';
import { AccessoryService } from './accessory.service';
import { Accessory, AccessorySchema } from './schemas/accessory.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Accessory.name, schema: AccessorySchema },
    ]),
    ResponseModule,
    CarModule,
    ContactModule,
  ],
  controllers: [AccessoryController],
  providers: [AccessoryService, AccessoryRepository],
  exports: [AccessoryRepository],
})
export class AccessoryModule {}
