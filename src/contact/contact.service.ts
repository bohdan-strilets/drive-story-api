import { HttpStatus, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { checkAccessRights } from 'src/common/functions/check-access-rights.function';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { ContactRepository } from './contact.repository';
import { ContactDto } from './dto/contact.dto';
import { ContactDocument } from './schemas/contact.schema';

@Injectable()
export class ContactService {
  constructor(
    private readonly responseService: ResponseService,
    private readonly contactRepository: ContactRepository,
  ) {}

  async add(
    userId: Types.ObjectId,
    dto: ContactDto,
  ): Promise<ApiResponse<ContactDocument>> {
    await this.contactRepository.ensureContactDoesNotExist(dto);
    const contact = await this.contactRepository.createContact(userId, dto);

    return this.responseService.createSuccessResponse(
      HttpStatus.CREATED,
      contact,
    );
  }

  async update(
    contactId: Types.ObjectId,
    userId: Types.ObjectId,
    dto: ContactDto,
  ): Promise<ApiResponse<ContactDocument>> {
    const contact = await this.contactRepository.findContact(contactId);

    this.contactRepository.validateContactDetailsUniqueness(contact, dto);
    checkAccessRights(contact.owner, userId);

    const updatedContact =
      await this.contactRepository.updateContact<ContactDto>(contactId, dto);

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedContact,
    );
  }

  async delete(
    contactId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<ContactDocument>> {
    const contact = await this.contactRepository.findContact(contactId);

    checkAccessRights(contact.owner, userId);
    await this.contactRepository.deleteImages(contact);

    const deletedContact =
      await this.contactRepository.deleteContact(contactId);

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      deletedContact,
    );
  }

  async byId(
    contactId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<ContactDocument>> {
    const contact = await this.contactRepository.findContact(contactId);
    checkAccessRights(contact.owner, userId);

    return this.responseService.createSuccessResponse(HttpStatus.OK, contact);
  }

  async all(
    userId: Types.ObjectId,
    page: number = 1,
    limit: number = 10,
  ): Promise<ApiResponse<ContactDocument[]>> {
    const contacts = await this.contactRepository.getAllContacts(
      userId,
      page,
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
      const contacts = await this.contactRepository.getContactByUser(userId);
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
