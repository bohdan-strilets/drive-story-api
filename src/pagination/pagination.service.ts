import { Injectable } from '@nestjs/common';
import { CreateMetaDto } from './dto/create-meta.dto';

@Injectable()
export class PaginationService {
  calculateTotalPages(totalItems: number, limit: number): number {
    return Math.ceil(totalItems / limit);
  }

  createMeta({
    limit,
    page,
    totalItems,
    totalPages,
    itemCount,
  }: CreateMetaDto) {
    return {
      totalItems,
      itemsPerPage: Number(limit),
      itemCount: itemCount,
      totalPages,
      currentPage: Number(page),
    };
  }
}
