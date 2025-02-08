import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages.helper';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { ContactDto } from './dto/contact.dto';
import { Contact, ContactDocument } from './schemas/contact.schema';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    @InjectModel(Contact.name)
    private contactModel: Model<ContactDocument>,
    private readonly responseService: ResponseService,
  ) {}

  async add(
    userId: Types.ObjectId,
    dto: ContactDto,
  ): Promise<ApiResponse<ContactDocument>> {
    const contact = await this.contactModel.findOne({
      name: dto.name,
      phone: dto.phone,
    });

    if (contact) {
      this.logger.error(errorMessages.CONTACT_ALREADY);
      throw new AppError(HttpStatus.CONFLICT, errorMessages.CONTACT_ALREADY);
    }

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
    const contact = await this.contactModel.findById(contactId);

    if (contact.name === dto.name || contact.phone === dto.phone) {
      this.logger.error(errorMessages.CONTACT_ALREADY);
      throw new AppError(HttpStatus.CONFLICT, errorMessages.CONTACT_ALREADY);
    }

    if (!contact) {
      this.logger.error(errorMessages.CONTACT_NOT_FOUND);
      throw new AppError(HttpStatus.NOT_FOUND, errorMessages.CONTACT_NOT_FOUND);
    }

    if (!contact.owner.equals(userId)) {
      this.logger.error(errorMessages.NO_ACCESS);
      throw new AppError(HttpStatus.FORBIDDEN, errorMessages.NO_ACCESS);
    }

    const updatedContact = await this.contactModel
      .findByIdAndUpdate(contactId, dto, { new: true })
      .populate('photos');

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedContact,
    );
  }

  async delete(
    contactId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<ContactDocument>> {
    const contact = await this.contactModel.findById(contactId);

    if (!contact) {
      this.logger.error(errorMessages.CONTACT_NOT_FOUND);
      throw new AppError(HttpStatus.NOT_FOUND, errorMessages.CONTACT_NOT_FOUND);
    }

    if (!contact.owner.equals(userId)) {
      this.logger.error(errorMessages.NO_ACCESS);
      throw new AppError(HttpStatus.FORBIDDEN, errorMessages.NO_ACCESS);
    }

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
    const contact = await this.contactModel
      .findById(contactId)
      .populate('photos');

    if (!contact) {
      this.logger.error(errorMessages.CONTACT_NOT_FOUND);
      throw new AppError(HttpStatus.NOT_FOUND, errorMessages.CONTACT_NOT_FOUND);
    }

    if (!contact.owner.equals(userId)) {
      this.logger.error(errorMessages.NO_ACCESS);
      throw new AppError(HttpStatus.FORBIDDEN, errorMessages.NO_ACCESS);
    }

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
}
