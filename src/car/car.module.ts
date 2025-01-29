import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResponseModule } from 'src/response/response.module';
import { CarController } from './car.controller';
import { CarService } from './car.service';
import { Car, CarSchema } from './schemas/car.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Car.name, schema: CarSchema }]),
    ResponseModule,
  ],
  controllers: [CarController],
  providers: [CarService],
})
export class CarModule {}
