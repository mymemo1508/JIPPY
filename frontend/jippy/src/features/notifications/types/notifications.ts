export interface CreateNoticeRequest {
  title: string;
  content: string;
  author: string;
}

export interface UpdateNoticeRequest {
  title: string;
  content: string;
}

export interface NoticeRequest {
  page: number;
  pageSize: number;
  sortBy: string;
  direction: "ASC" | "DESC";
  startDate: string;
  endDate: string;
}

export interface Notice {
  noticeId: number;
  storeId: number;
  title: string;
  content: string;
  createdAt: string;
  author: string;
}

export interface NoticeResponse {
  content: Notice[];
  page: number;
  author: string;
  startDate: string;
  endDate: string;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  isFirst: boolean;
  isLast: boolean;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface ApiSuccessResponse<T = unknown> {
  code: number;
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  status: string;
  code: string;
  message: string;
  success: false;
  errors: Array<{ reason: string }>;
}
