import { StaffScheduleData } from "@/features/calendar/types/calendar";
import { useCallback, useEffect, useState } from "react";
import staffApi from "./staffApi";

interface UseStaffScheduleReturn {
  data: StaffScheduleData[] | null;
  isLoading: boolean;
  error: string | null;
  refreshSchedule: () => Promise<void>;
}

const useStaffSchedule = (storeId: number): UseStaffScheduleReturn => {
  const [data, setData] = useState<StaffScheduleData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedule = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await staffApi.getAllSchedules(storeId);

      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.message || "스케줄을 불러오는데 실패했습니다.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  return {
    data,
    isLoading,
    error,
    refreshSchedule: fetchSchedule,
  };
};

export default useStaffSchedule;
