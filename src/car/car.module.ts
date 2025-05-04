import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaginationModule } from 'src/pagination/pagination.module';
import { ResponseModule } from 'src/response/response.module';
import { CarController } from './car.controller';
import { CarHelper } from './car.helper';
import { CarRepository } from './car.repository';
import { CarService } from './car.service';
import { Car, CarSchema } from './schemas/car.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Car.name, schema: CarSchema }]),
    ResponseModule,
    PaginationModule,
  ],
  controllers: [CarController],
  providers: [CarService, CarRepository, CarHelper],
  exports: [CarRepository, CarHelper],
})
export class CarModule {}
