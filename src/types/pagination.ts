export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_more: boolean;
}

export interface PageResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

export function arrayPage<T>(items: T[]): PageResponse<T> {
  return {
    items,
    pagination: {
      page: 1,
      limit: items.length,
      total: items.length,
      total_pages: items.length > 0 ? 1 : 0,
      has_more: false,
    },
  };
}
