import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CarModule } from 'src/car/car.module';
import { ResponseModule } from 'src/response/response.module';
import { AccessoryController } from './accessory.controller';
import { AccessoryService } from './accessory.service';
import { Accessory, AccessorySchema } from './schemas/accessory.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Accessory.name, schema: AccessorySchema },
    ]),
    ResponseModule,
    CarModule,
  ],
  controllers: [AccessoryController],
  providers: [AccessoryService],
})
export class AccessoryModule {}
