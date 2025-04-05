import { ApiResponse } from "@/features/attendance/types/attendance";
import {
  CreateScheduleRequest,
  DeleteStaffResponse,
  MonthlySalesResponse,
  StaffInfo,
  StaffMonthlyStatus,
  StaffSalesResponse,
  StaffTotalStatus,
  StoreSalaryResponse,
  TotalStoreSalaryResponse,
  UpdateScheduleRequest,
  UpdateStaffRequest,
  WorkingStaffResponse,
} from "../types/staff";
import { StaffScheduleData } from "@/features/calendar/types/calendar";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const staffApi = {
  getWorkingStaff: async (storeId: number): Promise<WorkingStaffResponse> => {
    const response = await fetch(
      `${BASE_URL}/api/dashboard/staff/${storeId}/working`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    if (!response.ok) throw new Error("Failed to fetch working status");
    return response.json();
  },

  getStaffStatus: async (
    storeId: number,
    staffId: number,
    date: string
  ): Promise<ApiResponse<StaffMonthlyStatus>> => {
    const response = await fetch(
      `${BASE_URL}/api/dashboard/staff/${storeId}/status/${staffId}?date=${date}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    if (!response.ok) throw new Error("Failed to fetch staff status");
    return response.json();
  },

  getStaffTotalStatus: async (
    storeId: number,
    staffId: number
  ): Promise<ApiResponse<StaffTotalStatus>> => {
    const response = await fetch(
      `${BASE_URL}/api/dashboard/staff/${storeId}/totalStatus/${staffId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    if (!response.ok) throw new Error("Failed to fetch staff status");
    return response.json();
  },

  getStaffList: async (storeId: number): Promise<ApiResponse<StaffInfo[]>> => {
    const response = await fetch(
      `${BASE_URL}/api/storeStaff/${storeId}/select`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    if (!response.ok) throw new Error("Failed to fetch staff list");
    return response.json();
  },

  getStaffDetail: async (storeId: string, staffId: string, token: string) => {
    const response = await fetch(
      `${BASE_URL}/api/storeStaff/${storeId}/select/${staffId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch staff detail");
    return response.json();
  },

  getStoreSalary: async (
    storeId: number,
    date: string
  ): Promise<StoreSalaryResponse> => {
    const response = await fetch(
      `${BASE_URL}/api/dashboard/staff/${storeId}/storeSalary?date=${date}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    if (!response.ok) throw new Error("Failed to fetch store salary");
    return response.json();
  },

  getTotalStoreSalary: async (
    storeId: number
  ): Promise<TotalStoreSalaryResponse> => {
    const response = await fetch(
      `${BASE_URL}/api/dashboard/staff/${storeId}/totalStoreSalary`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    if (!response.ok) throw new Error("Failed to fetch total store salary");
    return response.json();
  },

  updateStaff: async (
    storeId: number,
    staffId: number,
    data: UpdateStaffRequest
  ): Promise<UpdateStaffRequest> => {
    const response = await fetch(
      `${BASE_URL}/api/storeStaff/${storeId}/update/${staffId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      }
    );
    if (!response.ok) throw new Error("Failed to update staff");
    return response.json();
  },

  deleteStaff: async (
    storeId: number,
    staffId: number
  ): Promise<DeleteStaffResponse> => {
    const response = await fetch(
      `${BASE_URL}/api/storeStaff/${storeId}/delete/${staffId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    if (!response.ok) throw new Error("Failed to delete staff");
    return response.json();
  },

  getAllSchedules: async (
    storeId: number
  ): Promise<ApiResponse<StaffScheduleData[]>> => {
    const response = await fetch(`${BASE_URL}/api/calendar/${storeId}/select`, {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (!response.ok) throw new Error("스케줄 조회에 실패했습니다.");
    return response.json();
  },

  getStaffSchedule: async (
    storeId: number,
    staffId: number
  ): Promise<ApiResponse<StaffScheduleData>> => {
    const response = await fetch(
      `${BASE_URL}/api/calendar/${storeId}/select/${staffId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    if (!response.ok) throw new Error("직원 스케줄 조회에 실패했습니다.");
    return response.json();
  },

  createSchedule: async (
    storeId: number,
    staffId: number,
    data: CreateScheduleRequest
  ): Promise<ApiResponse<StaffScheduleData>> => {
    const response = await fetch(
      `${BASE_URL}/api/calendar/${storeId}/create/${staffId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) throw new Error("스케줄 등록에 실패했습니다.");
    return response.json();
  },

  updateSchedule: async (
    storeId: number,
    calendarId: number,
    data: UpdateScheduleRequest
  ): Promise<ApiResponse<StaffScheduleData>> => {
    const response = await fetch(
      `${BASE_URL}/api/calendar/${storeId}/update/${calendarId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) throw new Error("스케줄 수정에 실패했습니다.");
    return response.json();
  },

  deleteSchedule: async (
    storeId: number,
    calendarId: number
  ): Promise<ApiResponse<void>> => {
    const response = await fetch(
      `${BASE_URL}/api/calendar/${storeId}/delete/${calendarId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    if (!response.ok) throw new Error("스케줄 삭제에 실패했습니다.");
    return response.json();
  },

  fetchStaffSales: async (
    storeId: number,
    yearMonth: string
  ): Promise<StaffSalesResponse> => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/storeStaff/staff/earn?storeId=${storeId}&yearMonth=${yearMonth}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("직원 매출 조회에 실패했습니다");
      }

      return response.json();
    } catch (error) {
      console.error("직원 매출 조회 실패:", error);
      throw error;
    }
  },

  fetchMonthlySales: async (
    storeId: number,
    startDate: string,
    endDate: string
  ): Promise<MonthlySalesResponse> => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/payment-history/sales/month?storeId=${storeId}&startDate=${startDate}&endDate=${endDate}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("월별 매출 조회에 실패했습니다");
      }

      return response.json();
    } catch (error) {
      console.error("월별 매출 조회 실패:", error);
      throw error;
    }
  },
};

export default staffApi;
