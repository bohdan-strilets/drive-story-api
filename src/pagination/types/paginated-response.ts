import { PaginationMeta } from './pagination-meta.type';

export type PaginatedResponse<T> = {
  data: T[];
  meta: PaginationMeta;
};
