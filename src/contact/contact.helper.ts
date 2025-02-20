import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages.helper';
import { EntityType } from 'src/image/enums/entity-type.enum';
import { ImageHelper } from 'src/image/image.helper';
import { ContactRepository } from './contact.repository';
import { ContactDto } from './dto/contact.dto';
import { ContactDocument } from './schemas/contact.schema';

@Injectable()
export class ContactHelper {
  private readonly logger = new Logger(ContactHelper.name);

  constructor(
    private readonly contactRepository: ContactRepository,
    private readonly imageHelper: ImageHelper,
  ) {}

  async ensureContactDoesNotExist(name: string, phone: string) {
    const contact = await this.contactRepository.findContactByPhoneOrName(
      name,
      phone,
    );

    if (contact) {
      this.logger.error(errorMessages.CONTACT_ALREADY);
      throw new AppError(HttpStatus.CONFLICT, errorMessages.CONTACT_ALREADY);
    }
  }

  validateContactDetailsUniqueness(
    existingContact: ContactDocument,
    contactDto: ContactDto,
  ): void {
    if (
      existingContact.name === contactDto.name ||
      existingContact.phone === contactDto.phone
    ) {
      this.logger.error(errorMessages.CONTACT_ALREADY);
      throw new AppError(HttpStatus.CONFLICT, errorMessages.CONTACT_ALREADY);
    }
  }

  isValidContact(contact: ContactDocument): void {
    if (!contact) {
      this.logger.error(errorMessages.CONTACT_NOT_FOUND);
      throw new AppError(HttpStatus.NOT_FOUND, errorMessages.CONTACT_NOT_FOUND);
    }
  }

  async deletePhotos(contact: ContactDocument): Promise<void> {
    const photos = contact.photos;

    if (photos) {
      await this.imageHelper.removeAllImages(
        photos._id,
        EntityType.CONTACTS,
        contact._id,
      );
    }
  }
}
