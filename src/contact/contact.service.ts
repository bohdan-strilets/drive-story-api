import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { ContactRepository } from './contact.repository';
import { ContactDto } from './dto/contact.dto';
import { Contact, ContactDocument } from './schemas/contact.schema';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    @InjectModel(Contact.name)
    private contactModel: Model<ContactDocument>,
    private readonly responseService: ResponseService,
    private readonly contactRepository: ContactRepository,
  ) {}

  async add(
    userId: Types.ObjectId,
    dto: ContactDto,
  ): Promise<ApiResponse<ContactDocument>> {
    await this.contactRepository.ensureContactDoesNotExist(dto);

    const data = { owner: userId, ...dto };
    const newContact = await this.contactModel.create(data);

    return this.responseService.createSuccessResponse(
      HttpStatus.CREATED,
      newContact,
    );
  }

  async update(
    contactId: Types.ObjectId,
    userId: Types.ObjectId,
    dto: ContactDto,
  ): Promise<ApiResponse<ContactDocument>> {
    const contact = await this.contactRepository.findContactById(contactId);

    this.contactRepository.validateContactDetailsUniqueness(contact, dto);
    this.contactRepository.checkAccessRights(contact.owner, userId);

    const updatedContact = await this.contactRepository.updateContact(
      contactId,
      dto,
    );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedContact,
    );
  }

  async delete(
    contactId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<ContactDocument>> {
    const contact = await this.contactRepository.findContactById(contactId);
    this.contactRepository.checkAccessRights(contact.owner, userId);

    const deletedContact = await this.contactModel
      .findByIdAndDelete(contactId)
      .populate('photos');

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      deletedContact,
    );
  }

  async byId(
    contactId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<ContactDocument>> {
    const contact = await this.contactRepository.findContactById(contactId);
    this.contactRepository.checkAccessRights(contact.owner, userId);
    return this.responseService.createSuccessResponse(HttpStatus.OK, contact);
  }

  async all(
    userId: Types.ObjectId,
    page: number = 1,
    limit: number = 10,
  ): Promise<ApiResponse<ContactDocument[]>> {
    const skip = (page - 1) * limit;

    const fueling = await this.contactModel
      .find({ owner: userId })
      .skip(skip)
      .limit(limit)
      .populate('photos');

    return this.responseService.createSuccessResponse(HttpStatus.OK, fueling);
  }

  async filterContactsByNameOrPhone(
    userId: Types.ObjectId,
    searchQuery: string,
  ): Promise<ApiResponse<ContactDocument[]>> {
    if (!searchQuery) {
      const contacts = await this.contactModel.find({ owner: userId }).exec();
      return this.responseService.createSuccessResponse(
        HttpStatus.OK,
        contacts,
      );
    }

    const regex = new RegExp(searchQuery, 'i');
    const contacts = await this.contactRepository.filterByNameOrPhone(
      userId,
      regex,
    );

    return this.responseService.createSuccessResponse(HttpStatus.OK, contacts);
  }
}
