import { useCallback, useEffect, useState } from "react";
import {
  MonthlyPerformanceData,
  StaffMonthlyStatus,
  StaffTotalStatus,
  WorkingStaffData,
} from "../types/staff";
import staffApi from "./staffApi";

interface WorkingStaffState {
  data: WorkingStaffData | null;
  isLoading: boolean;
  error: Error | null;
}

interface StaffMonthlyStatusState {
  data: StaffMonthlyStatus | null;
  isLoading: boolean;
  error: Error | null;
}

interface StaffTotalStatusState {
  data: StaffTotalStatus | null;
  isLoading: boolean;
  error: Error | null;
}

const useWorkingStaff = (storeId: number): WorkingStaffState => {
  const [data, setData] = useState<WorkingStaffData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWorkingStaff = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await staffApi.getWorkingStaff(storeId);

      if (response.success) {
        setData(response.data);
      } else {
        throw new Error("근무 현황을 불러오는데 실패했습니다");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("알 수 없는 에러가 발생했습니다")
      );
    } finally {
      setIsLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchWorkingStaff();
  }, [fetchWorkingStaff]);

  return { data, isLoading, error };
};

const useStaffMonthlyStatus = (
  storeId: number,
  staffId: number,
  date: string
): StaffMonthlyStatusState => {
  const [data, setData] = useState<StaffMonthlyStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setIsLoading(true);
        const response = await staffApi.getStaffStatus(storeId, staffId, date);

        if (response.success) {
          setData(response.data);
        } else {
          throw new Error(response.message || "데이터 조회 실패");
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("알 수 없는 에러가 발생했습니다")
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, [storeId, staffId, date]);

  return { data, isLoading, error };
};

const useStaffTotalStatus = (
  storeId: number,
  staffId: number
): StaffTotalStatusState => {
  const [data, setData] = useState<StaffTotalStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTotalStats = async () => {
      try {
        setIsLoading(true);
        const response = await staffApi.getStaffTotalStatus(storeId, staffId);

        if (response.success) {
          setData(response.data);
        } else {
          throw new Error(response.message || "데이터 조회 실패");
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("알 수 없는 에러가 발생했습니다")
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTotalStats();
  }, [storeId, staffId]);

  return { data, isLoading, error };
};

const useStaffStatus = (storeId: number, staffId: number) => {
  const currentDate = new Date().toISOString().slice(0, 7);
  const monthlyStats = useStaffMonthlyStatus(storeId, staffId, currentDate);
  const totalStats = useStaffTotalStatus(storeId, staffId);

  return { monthlyStats, totalStats };
};

const useStaffPerformance = (storeId: number) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthlySales, setMonthlySales] = useState<MonthlyPerformanceData[]>(
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const currentDate = new Date();

        const previousMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1
        );

        const yearMonth = `${previousMonth.getFullYear()}-${String(
          previousMonth.getMonth() + 1
        ).padStart(2, "0")}`;

        const startDate = yearMonth;
        const endDate = yearMonth;

        const [salesResponse, staffResponse] = await Promise.all([
          staffApi.fetchMonthlySales(storeId, startDate, endDate),
          staffApi.fetchStaffSales(storeId, yearMonth),
        ]);

        if (!salesResponse.success || !staffResponse.success) {
          throw new Error("데이터 조회에 실패했습니다");
        }

        const totalSales = salesResponse.data.salesByMonth.reduce(
          (sum, day) => sum + day.totalSales,
          0
        );

        setMonthlySales([
          {
            yearMonth,
            totalSales,
            staffSales: staffResponse.data,
          },
        ]);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "데이터 로딩에 실패했습니다"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [storeId]);

  return { isLoading, error, monthlySales };
};

export {
  useWorkingStaff,
  useStaffMonthlyStatus,
  useStaffTotalStatus,
  useStaffStatus,
  useStaffPerformance,
};
