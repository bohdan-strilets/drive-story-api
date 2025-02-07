import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CarModule } from 'src/car/car.module';
import { ResponseModule } from 'src/response/response.module';
import { FuelingController } from './fueling.controller';
import { FuelingService } from './fueling.service';
import { Fueling, FuelingSchema } from './schemas/fueling.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Fueling.name, schema: FuelingSchema }]),
    ResponseModule,
    CarModule,
  ],
  controllers: [FuelingController],
  providers: [FuelingService],
})
export class FuelingModule {}
