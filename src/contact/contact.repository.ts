import { HttpStatus, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages.helper';
import { ContactDto } from './dto/contact.dto';
import { Contact, ContactDocument } from './schemas/contact.schema';

export class ContactRepository {
  private readonly logger = new Logger(ContactRepository.name);

  constructor(
    @InjectModel(Contact.name)
    private contactModel: Model<ContactDocument>,
  ) {}

  async findContactById(contactId: Types.ObjectId): Promise<ContactDocument> {
    const contact = await this.contactModel
      .findById(contactId)
      .populate('photos');

    if (!contact) {
      this.logger.error(errorMessages.CONTACT_NOT_FOUND);
      throw new AppError(HttpStatus.NOT_FOUND, errorMessages.CONTACT_NOT_FOUND);
    }

    return contact;
  }

  checkAccessRights(
    resourceOwnerId: Types.ObjectId,
    currentUserId: Types.ObjectId,
  ): void {
    if (!resourceOwnerId.equals(currentUserId)) {
      this.logger.error(errorMessages.NO_ACCESS);
      throw new AppError(HttpStatus.FORBIDDEN, errorMessages.NO_ACCESS);
    }
  }

  async updateContact(
    contactId: Types.ObjectId,
    dto: any,
  ): Promise<ContactDocument> {
    return await this.contactModel
      .findByIdAndUpdate(contactId, dto, { new: true })
      .populate('photos');
  }

  validateContactDetailsUniqueness(
    existingContact: Contact,
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

  async ensureContactDoesNotExist(dto: ContactDto) {
    const contact = await this.contactModel.findOne({
      name: dto.name,
      phone: dto.phone,
    });

    if (contact) {
      this.logger.error(errorMessages.CONTACT_ALREADY);
      throw new AppError(HttpStatus.CONFLICT, errorMessages.CONTACT_ALREADY);
    }
  }
}
