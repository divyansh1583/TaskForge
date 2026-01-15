/**
 * Standard API error response format.
 */
export interface ApiError {
  type: string;
  title: string;
  status: number;
  detail?: string;
  errors?: { [key: string]: string[] };
}

/**
 * Generic API response wrapper.
 */
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  succeeded: boolean;
  errors?: string[];
}

/**
 * Paginated list response.
 */
export interface PaginatedList<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/**
 * Pagination query parameters.
 */
export interface PaginationParams {
  pageNumber: number;
  pageSize: number;
  sortBy?: string;
  sortDescending?: boolean;
  searchTerm?: string;
}
