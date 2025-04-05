export type AttendanceStatus = "NONE" | "CHECKED_IN" | "CHECKED_OUT";

// API 관련 타입
export interface WorkingStaff {
  staffId: number;
  name: string;
}

export interface WorkingStaffResponse {
  totalCount: number;
  staffList: WorkingStaff[];
}

export interface CheckInResponse {
  checkInTime: string;
  status: AttendanceStatus;
}

export interface CheckOutResponse {
  checkOutTime: string;
  status: AttendanceStatus;
}

// API 응답 공통 타입
export interface ApiSuccessResponse<T> {
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

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// 컴포넌트 Props 타입
export interface AttendanceButtonsProps {
  className?: string;
  storeId: number;
  staffId: number;
}
