import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { MaintenanceModule } from 'src/maintenance/maintenance.module';
import { ResponseModule } from 'src/response/response.module';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { Image, ImageSchema } from './schemas/image.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Image.name, schema: ImageSchema }]),
    CloudinaryModule,
    ResponseModule,
    MaintenanceModule,
  ],
  controllers: [ImageController],
  providers: [ImageService],
})
export class ImageModule {}
