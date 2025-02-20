import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { calculateSkip } from 'src/common/helpers/calculate-skip.helper';
import { checkAccess } from 'src/common/helpers/check-access.helper';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages.helper';
import { EntityType } from 'src/image/enums/entity-type.enum';
import { ImageHelper } from 'src/image/image.helper';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { ContactRepository } from './contact.repository';
import { ContactDto } from './dto/contact.dto';
import { ContactDocument } from './schemas/contact.schema';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    private readonly responseService: ResponseService,
    private readonly contactRepository: ContactRepository,
    private readonly imageHelper: ImageHelper,
  ) {}

  private async ensureContactDoesNotExist(name: string, phone: string) {
    const contact = await this.contactRepository.findContactByPhoneOrName(
      name,
      phone,
    );

    if (contact) {
      this.logger.error(errorMessages.CONTACT_ALREADY);
      throw new AppError(HttpStatus.CONFLICT, errorMessages.CONTACT_ALREADY);
    }
  }

  async create(
    userId: Types.ObjectId,
    dto: ContactDto,
  ): Promise<ApiResponse<ContactDocument>> {
    await this.ensureContactDoesNotExist(dto.name, dto.phone);

    const payload = { owner: userId, ...dto };
    const contact = await this.contactRepository.createContact(payload);

    return this.responseService.createSuccessResponse(
      HttpStatus.CREATED,
      contact,
    );
  }

  private validateContactDetailsUniqueness(
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

  private isValidContact(contact: ContactDocument): void {
    if (!contact) {
      this.logger.error(errorMessages.CONTACT_NOT_FOUND);
      throw new AppError(HttpStatus.NOT_FOUND, errorMessages.CONTACT_NOT_FOUND);
    }
  }

  async update(
    contactId: Types.ObjectId,
    userId: Types.ObjectId,
    dto: ContactDto,
  ): Promise<ApiResponse<ContactDocument>> {
    const contact = await this.contactRepository.findContactById(contactId);

    this.isValidContact(contact);
    this.validateContactDetailsUniqueness(contact, dto);
    checkAccess(contact.owner, userId);

    const updatedContact = await this.contactRepository.updateContact(
      contactId,
      dto,
    );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedContact,
    );
  }

  private async deletePhotos(contact: ContactDocument): Promise<void> {
    const photos = contact.photos;

    if (photos) {
      await this.imageHelper.removeAllImages(
        photos._id,
        EntityType.CONTACTS,
        contact._id,
      );
    }
  }

  async delete(
    contactId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<ContactDocument>> {
    const contact = await this.contactRepository.findContactById(contactId);

    this.isValidContact(contact);
    checkAccess(contact.owner, userId);

    await this.deletePhotos(contact);

    const deletedContact =
      await this.contactRepository.deleteContact(contactId);

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      deletedContact,
    );
  }

  async getById(
    contactId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<ContactDocument>> {
    const contact = await this.contactRepository.findContactById(contactId);

    this.isValidContact(contact);
    checkAccess(contact.owner, userId);

    return this.responseService.createSuccessResponse(HttpStatus.OK, contact);
  }

  async getAll(
    userId: Types.ObjectId,
    page: number,
    limit: number,
  ): Promise<ApiResponse<ContactDocument[]>> {
    const skip = calculateSkip(page, limit);

    const contacts = await this.contactRepository.findAllContactsByUser(
      userId,
      skip,
      limit,
    );

    return this.responseService.createSuccessResponse(HttpStatus.OK, contacts);
  }

  async filterContactsByNameOrPhone(
    userId: Types.ObjectId,
    searchQuery: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<ApiResponse<ContactDocument[]>> {
    if (!searchQuery) {
      const contacts = await this.contactRepository.findAllContactsByUser(
        userId,
        page,
        limit,
      );

      return this.responseService.createSuccessResponse(
        HttpStatus.OK,
        contacts,
      );
    }

    const regex = new RegExp(searchQuery, 'i');
    const contacts = await this.contactRepository.filterByNameOrPhone(
      userId,
      regex,
      page,
      limit,
    );

    return this.responseService.createSuccessResponse(HttpStatus.OK, contacts);
  }
}
