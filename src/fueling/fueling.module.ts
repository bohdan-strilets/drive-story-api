import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CarModule } from 'src/car/car.module';
import { ImageModule } from 'src/image/image.module';
import { ResponseModule } from 'src/response/response.module';
import { FuelingController } from './fueling.controller';
import { FuelingRepository } from './fueling.repository';
import { FuelingService } from './fueling.service';
import { Fueling, FuelingSchema } from './schemas/fueling.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Fueling.name, schema: FuelingSchema }]),
    ResponseModule,
    CarModule,
    forwardRef(() => ImageModule),
  ],
  controllers: [FuelingController],
  providers: [FuelingService, FuelingRepository],
  exports: [FuelingRepository],
})
export class FuelingModule {}
