import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { calculateSkip } from 'src/common/helpers/calculate-skip.helper';
import { checkAccess } from 'src/common/helpers/check-access.helper';
import { PaginationService } from 'src/pagination/pagination.service';
import { PaginatedResponse } from 'src/pagination/types/paginated-response';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { ContactHelper } from './contact.helper';
import { ContactRepository } from './contact.repository';
import { ContactDto } from './dto/contact.dto';
import { ContactDocument } from './schemas/contact.schema';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    private readonly responseService: ResponseService,
    private readonly contactRepository: ContactRepository,
    private readonly contactHelper: ContactHelper,
    private readonly paginationService: PaginationService,
  ) {}

  async create(
    userId: Types.ObjectId,
    dto: ContactDto,
  ): Promise<ApiResponse<ContactDocument>> {
    await this.contactHelper.ensureContactDoesNotExist(dto.name, dto.phone);

    const payload = { owner: userId, ...dto };
    const contact = await this.contactRepository.createContact(payload);

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
    const contact = await this.contactRepository.findContactById(contactId);

    this.contactHelper.isValidContact(contact);
    this.contactHelper.validateContactDetailsUniqueness(contact, dto);
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

  async delete(
    contactId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<ContactDocument>> {
    const contact = await this.contactRepository.findContactById(contactId);

    this.contactHelper.isValidContact(contact);
    checkAccess(contact.owner, userId);

    await this.contactHelper.deletePhotos(contact);

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

    this.contactHelper.isValidContact(contact);
    checkAccess(contact.owner, userId);

    return this.responseService.createSuccessResponse(HttpStatus.OK, contact);
  }

  async getAll(
    userId: Types.ObjectId,
    page: number,
    limit: number,
  ): Promise<ApiResponse<PaginatedResponse<ContactDocument>>> {
    const skip = calculateSkip(page, limit);
    const result = await this.contactRepository.findAndCountContacts(
      userId,
      skip,
      limit,
    );

    const totalPages = this.paginationService.calculateTotalPages(
      result.totalItems,
      limit,
    );

    const meta = this.paginationService.createMeta({
      limit,
      page,
      itemCount: result.items.length,
      totalItems: result.totalItems,
      totalPages,
    });

    return this.responseService.createSuccessResponse(HttpStatus.OK, {
      data: result.items,
      meta,
    });
  }

  async filterContactsByNameOrPhone(
    userId: Types.ObjectId,
    searchQuery: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<ApiResponse<PaginatedResponse<ContactDocument>>> {
    if (!searchQuery) {
      const response = await this.getAll(userId, page, limit);

      return this.responseService.createSuccessResponse(
        HttpStatus.OK,
        response.data,
      );
    }

    const skip = calculateSkip(page, limit);
    const regex = new RegExp(searchQuery, 'i');

    const result = await this.contactRepository.filterByNameOrPhone(
      userId,
      regex,
      skip,
      limit,
    );
    const totalPages = this.paginationService.calculateTotalPages(
      result.totalItems,
      limit,
    );

    const meta = this.paginationService.createMeta({
      limit,
      page,
      itemCount: result.items.length,
      totalItems: result.totalItems,
      totalPages,
    });

    return this.responseService.createSuccessResponse(HttpStatus.OK, {
      data: result.items,
      meta,
    });
  }
}
