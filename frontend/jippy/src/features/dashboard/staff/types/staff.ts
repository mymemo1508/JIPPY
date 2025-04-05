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

export type StaffType = "OWNER" | "MANAGER" | "STAFF";
export type UpdateableStaffType = "MANAGER" | "STAFF";
export type SalaryType = "시급" | "월급";

export interface StaffInfo {
  staffId: number;
  staffName: string;
  staffType: StaffType;
  staffSalary: number;
  staffSalaryType: SalaryType;
}

export type StaffListResponse = ApiResponse<StaffInfo[]>;

export interface WorkingStaff {
  storeUserStaffId: number;
  name: string;
}

export interface WorkingStaffData {
  totalCount: number;
  staffList: WorkingStaff[];
}

export type WorkingStaffResponse = ApiResponse<WorkingStaffData>;

export interface StaffMonthlyStatus {
  storeUserStaffId: number;
  salary: number;
  lateCount: number;
  earlyLeaveCount: number;
  workMinutes: number;
}

export type StaffMonthlyStatusResponse = ApiResponse<StaffMonthlyStatus>;

export interface UpdateStaffRequest {
  staffType?: UpdateableStaffType;
  staffSalary?: number;
  staffSalaryType?: SalaryType;
}

export type UpdateStaffResponse = ApiResponse<StaffInfo>;

export type DeleteStaffResponse = ApiResponse<void>;

export interface StaffTotalStatus {
  storeUserStaffId: number;
  totalSalary: number;
  totalLateCount: number;
  totalEarlyLeaveCount: number;
  totalWorkMinutes: number;
}

export type StaffTotalStatusResponse = ApiResponse<StaffTotalStatus>;

export interface StoreSalary {
  storeSalary: number;
}

export interface TotalStoreSalary {
  totalStoreSalary: number;
}

export type StoreSalaryResponse = ApiResponse<StoreSalary>;
export type TotalStoreSalaryResponse = ApiResponse<TotalStoreSalary>;

export interface CreateScheduleRequest {
  schedules: Array<{
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }>;
}

export interface UpdateScheduleRequest {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export const SCHEDULE_COLORS = {
  legend: [
    "bg-blue-200",
    "bg-green-200",
    "bg-pink-200",
    "bg-purple-200",
    "bg-orange-200",
    "bg-teal-200",
    "bg-yellow-200",
    "bg-red-200",
    "bg-indigo-200",
    "bg-amber-200",
    "bg-lime-200",
    "bg-emerald-200",
    "bg-cyan-200",
    "bg-rose-200",
    "bg-gray-200",
  ],
  schedule: [
    "bg-blue-200/50",
    "bg-green-200/50",
    "bg-pink-200/50",
    "bg-purple-200/50",
    "bg-orange-200/50",
    "bg-teal-200/50",
    "bg-yellow-200/50",
    "bg-red-200/50",
    "bg-indigo-200/50",
    "bg-amber-200/50",
    "bg-lime-200/50",
    "bg-emerald-200/50",
    "bg-cyan-200/50",
    "bg-rose-200/50",
    "bg-gray-200/50",
  ],
} as const;

export interface StaffSalesInfo {
  staffId: number;
  staffName: string;
  earnSales: number;
}

export interface MonthlySalesData {
  date: string;
  totalSales: number;
  orderCount: number;
}

export interface SalesByMonthResponse {
  salesByMonth: MonthlySalesData[];
}

export type StaffSalesResponse = ApiResponse<StaffSalesInfo[]>;
export type MonthlySalesResponse = ApiResponse<SalesByMonthResponse>;

export interface MonthlyPerformanceData {
  yearMonth: string;
  totalSales: number;
  staffSales: StaffSalesInfo[];
}
