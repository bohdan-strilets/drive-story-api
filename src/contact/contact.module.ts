import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResponseModule } from 'src/response/response.module';
import { ContactController } from './contact.controller';
import { ContactRepository } from './contact.repository';
import { ContactService } from './contact.service';
import { Contact, ContactSchema } from './schemas/contact.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Contact.name, schema: ContactSchema }]),
    ResponseModule,
  ],
  controllers: [ContactController],
  providers: [ContactService, ContactRepository],
  exports: [ContactRepository],
})
export class ContactModule {}
