import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CarModule } from 'src/car/car.module';
import { ImageModule } from 'src/image/image.module';
import { ResponseModule } from 'src/response/response.module';
import { InsuranceController } from './insurance.controller';
import { InsuranceHelper } from './insurance.helper';
import { InsuranceRepository } from './insurance.repository';
import { InsuranceService } from './insurance.service';
import { Insurance, InsuranceSchema } from './schemas/insurance.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Insurance.name, schema: InsuranceSchema },
    ]),
    ResponseModule,
    CarModule,
    forwardRef(() => ImageModule),
  ],
  controllers: [InsuranceController],
  providers: [InsuranceService, InsuranceRepository, InsuranceHelper],
  exports: [InsuranceRepository],
})
export class InsuranceModule {}
