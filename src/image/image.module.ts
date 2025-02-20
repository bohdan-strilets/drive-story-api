import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccessoryModule } from 'src/accessory/accessory.module';
import { CarModule } from 'src/car/car.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { ContactModule } from 'src/contact/contact.module';
import { FuelingModule } from 'src/fueling/fueling.module';
import { InspectionModule } from 'src/inspection/inspection.module';
import { InsuranceModule } from 'src/insurance/insurance.module';
import { MaintenanceModule } from 'src/maintenance/maintenance.module';
import { ResponseModule } from 'src/response/response.module';
import { UserModule } from 'src/user/user.module';
import { ImageController } from './image.controller';
import { ImageHelper } from './image.helper';
import { ImageRepository } from './image.repository';
import { ImageService } from './image.service';
import { Image, ImageSchema } from './schemas/image.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Image.name, schema: ImageSchema }]),
    CloudinaryModule,
    ResponseModule,
    forwardRef(() => MaintenanceModule),
    forwardRef(() => CarModule),
    forwardRef(() => UserModule),
    forwardRef(() => FuelingModule),
    forwardRef(() => AccessoryModule),
    forwardRef(() => ContactModule),
    forwardRef(() => InsuranceModule),
    forwardRef(() => InspectionModule),
  ],
  controllers: [ImageController],
  providers: [ImageService, ImageRepository, ImageHelper],
  exports: [ImageRepository, ImageHelper],
})
export class ImageModule {}
