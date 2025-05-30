import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ImageModule } from 'src/image/image.module';
import { PaginationModule } from 'src/pagination/pagination.module';
import { ResponseModule } from 'src/response/response.module';
import { ContactController } from './contact.controller';
import { ContactHelper } from './contact.helper';
import { ContactRepository } from './contact.repository';
import { ContactService } from './contact.service';
import { Contact, ContactSchema } from './schemas/contact.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Contact.name, schema: ContactSchema }]),
    ResponseModule,
    forwardRef(() => ImageModule),
    PaginationModule,
  ],
  controllers: [ContactController],
  providers: [ContactService, ContactRepository, ContactHelper],
  exports: [ContactRepository],
})
export class ContactModule {}
