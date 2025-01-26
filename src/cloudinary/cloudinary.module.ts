import { Module } from '@nestjs/common';
import { ResponseModule } from 'src/response/response.module';
import { CloudinaryService } from './cloudinary.service';

@Module({
  imports: [ResponseModule],
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
