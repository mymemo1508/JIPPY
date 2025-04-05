import { useState } from "react";
import {
  ApiResponse,
  CheckInResponse,
  CheckOutResponse,
} from "../types/attendance";

const useAttendanceAction = (storeId: number) => {
  const [isLoading, setIsLoading] = useState(false);
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

  const getStaffId = () => {
    const token = document.cookie
      .split("; ")
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith("userId="))
      ?.split("=")[1];
    console.log(token);
    return token;
  };

  const getLocation = async (): Promise<{
    latitude: number;
    longitude: number;
    accuracy: number;
  }> => {
    return new Promise((resolve, reject) => {
      if (!("geolocation" in navigator)) {
        const errorMsg = "Geolocation이 지원되지 않는 브라우저입니다.";
        console.log(errorMsg);
        return reject(new Error(errorMsg));
      }

      let attempts = 0;
      let bestCoords: {
        latitude: number;
        longitude: number;
        accuracy: number;
      } | null = null;

      const getHighPrecisionLocation = () => {
        navigator.geolocation.getCurrentPosition(
          (position: GeolocationPosition) => {
            const latitude = parseFloat(position.coords.latitude.toFixed(15)); // 소수점 15자리 유지
            const longitude = parseFloat(position.coords.longitude.toFixed(15));
            const accuracy = position.coords.accuracy; // 미터 단위 정확도 (낮을수록 좋음)

            console.log(
              `📍 현재 위치 (시도 ${
                attempts + 1
              }): ${latitude}, ${longitude} (정확도: ${accuracy}m)`
            );

            // 가장 정확한 위치 선택 (accuracy 값이 가장 낮은 것)
            if (!bestCoords || accuracy < bestCoords.accuracy) {
              bestCoords = { latitude, longitude, accuracy };
            }

            attempts++;

            // 최소 3번 반복 후 가장 정확한 값 반환
            if (attempts >= 3) {
              console.log("✅ 최종 선택된 위치:", bestCoords);
              return resolve(bestCoords);
            } else {
              setTimeout(getHighPrecisionLocation, 2000); // 2초 후 다시 요청
            }
          },
          (err: GeolocationPositionError) => {
            console.log(`❌ 위치 정보를 가져올 수 없습니다: ${err.message}`);
            reject(new Error(`위치 정보를 가져올 수 없습니다: ${err.message}`));
          },
          {
            enableHighAccuracy: true, // ✅ 고정밀 모드 활성화
            timeout: 30000, // 30초 내에 최대한 정확한 위치 가져오기
            maximumAge: 0, // ✅ 항상 최신 위치를 요청 (캐시된 값 사용 안 함)
          }
        );
      };

      getHighPrecisionLocation();
    });
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const checkIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { latitude, longitude } = await getLocation();

      console.log("✅ 서버로 보낼 위도:", latitude);
      console.log("✅ 서버로 보낼 경도:", longitude);

      if (latitude === null || longitude === null) {
        throw new Error("위치 정보를 가져올 수 없습니다.");
      }
      const staffId = getStaffId();
      const token = getAuthToken();
      const response = await fetch(
        `${API_URL}/api/attendance/${storeId}/checkIn`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            latitude, // 위도 추가
            longitude, // 경도 추가
            staffId,
          }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Error response:", errorText);
        throw new Error("리소스를 찾을 수 없습니다.");
      }

      const result: ApiResponse<CheckInResponse> = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      return result.data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "출근 처리 실패";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const checkOut = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/api/attendance/checkOut`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      const result: ApiResponse<CheckOutResponse> = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      return result.data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "퇴근 처리 실패";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    checkIn,
    checkOut,
    isLoading,
    error,
  };
};

export default useAttendanceAction;
