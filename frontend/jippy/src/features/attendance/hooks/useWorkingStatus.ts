import { useState, useEffect, useCallback } from "react";
import { WorkingStaffResponse, ApiResponse } from "../types/attendance";

const useWorkingStatus = (storeId: number, staffId: number) => {
  const [isWorking, setIsWorking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = () => {
    const token = document.cookie
      .split("; ")
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith("accessToken="))
      ?.split("=")[1];
    console.log(token);
    return token;
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const checkWorkingStatus = useCallback(async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_URL}/api/dashboard/staff/${storeId}/working`,
        {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );
      const result: ApiResponse<WorkingStaffResponse> = await response.json();

      console.log(result);
      if (!result.success) {
        throw new Error(result.message);
      }

      if (result.data.totalCount === 0) {
        setIsWorking(false);
        setError(null);
        return;
      }

      const isCurrentStaffWorking = result.data.staffList.some(
        (staff) => staff.staffId === staffId
      );
      console.log(isCurrentStaffWorking);
      setIsWorking(isCurrentStaffWorking);
      setError(error);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "근무 상태 확인 실패";
      setError(errorMessage);
      console.error("근무 상태 확인 실패:", err);
    } finally {
      setIsLoading(false);
    }
  }, [storeId, staffId]);

  useEffect(() => {
    checkWorkingStatus();
  }, [checkWorkingStatus]);

  return { isWorking, isLoading, error, refreshStatus: checkWorkingStatus };
};

export default useWorkingStatus;
