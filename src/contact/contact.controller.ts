import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ParseObjectIdPipe } from 'src/car/pipes/parse-objectid.pipe';
import { PaginatedResponse } from 'src/pagination/types/paginated-response';
import { ApiResponse } from 'src/response/types/api-response.type';
import { User } from 'src/user/decorators/user.decorator';
import { ContactService } from './contact.service';
import { ContactDto } from './dto/contact.dto';
import { ContactDocument } from './schemas/contact.schema';

@Auth()
@Controller('v1/contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post('create')
  async create(
    @Body() dto: ContactDto,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<ContactDocument>> {
    return this.contactService.create(userId, dto);
  }

  @Patch('update/:contactId')
  async update(
    @Body() dto: ContactDto,
    @Param('contactId', ParseObjectIdPipe) contactId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<ContactDocument>> {
    return this.contactService.update(contactId, userId, dto);
  }

  @Delete('delete/:contactId')
  async delete(
    @Param('contactId', ParseObjectIdPipe) contactId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<ContactDocument>> {
    return this.contactService.delete(contactId, userId);
  }

  @Get('get-by-id/:contactId')
  async getById(
    @Param('contactId', ParseObjectIdPipe) contactId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<ContactDocument>> {
    return this.contactService.getById(contactId, userId);
  }

  @Get('get-all')
  async getAll(
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<ApiResponse<PaginatedResponse<ContactDocument>>> {
    return this.contactService.getAll(userId, page, limit);
  }

  @Get('filter')
  async filterContactsByNameOrPhone(
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
    @Query('searchQuery') searchQuery: string = '',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<ApiResponse<PaginatedResponse<ContactDocument>>> {
    return this.contactService.filterContactsByNameOrPhone(
      userId,
      searchQuery,
      page,
      limit,
    );
  }
}
