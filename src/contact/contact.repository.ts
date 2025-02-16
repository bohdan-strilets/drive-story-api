import { forwardRef, HttpStatus, Inject, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages.helper';
import { EntityType } from 'src/image/enums/entity-type.enum';
import { ImageRepository } from 'src/image/image.repository';
import { ContactDto } from './dto/contact.dto';
import { Contact, ContactDocument } from './schemas/contact.schema';

export class ContactRepository {
  private readonly logger = new Logger(ContactRepository.name);

  constructor(
    @InjectModel(Contact.name)
    private contactModel: Model<ContactDocument>,
    @Inject(forwardRef(() => ImageRepository))
    private readonly imageRepository: ImageRepository,
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

  async bindImage(
    contactId: Types.ObjectId,
    data: Types.ObjectId | null,
  ): Promise<ContactDocument> {
    await this.findContactById(contactId);
    return await this.updateContact(contactId, { photos: data });
  }

  async filterByNameOrPhone(
    userId: Types.ObjectId,
    regex: RegExp,
    page: number,
    limit: number,
  ) {
    const skip = (page - 1) * limit;

    return await this.contactModel
      .find({
        owner: userId,
        $or: [{ name: { $regex: regex } }, { phone: { $regex: regex } }],
      })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async deleteImages(contact: ContactDocument): Promise<void> {
    const photos = contact.photos;

    if (photos) {
      await this.imageRepository.removedAllFiles(
        photos._id,
        EntityType.CONTACTS,
        contact._id,
      );
    }
  }
}
