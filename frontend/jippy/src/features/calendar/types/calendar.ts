// API 응답 타입
export interface Schedule {
  calendarId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface StaffScheduleData {
  storeUserStaffId: number;
  staffName: string;
  schedules: Schedule[];
}

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

// 캘린더 그리드용 타입
export interface TimeSlot {
  time: string;
  format: string;
  originalHour: number;
}

// 스케줄 이벤트 타입
export interface ScheduleEvent {
  id: number;
  startTime: string;
  endTime: string;
  dayOfWeek: string;
  height: number;
  top: number;
}

export const DAYS_OF_WEEK = ["일", "월", "화", "수", "목", "금", "토"] as const;
