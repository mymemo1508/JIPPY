"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/features/common/components/ui/LoadingSpinner";
import {
  ApiResponse,
  StaffScheduleData,
  TimeSlot,
} from "@/features/calendar/types/calendar";
import PageTitle from "@/features/common/components/layout/title/PageTitle";
import CalendarGrid from "@/features/calendar/components/CalendarGrid";
import CalendarHeader from "@/features/calendar/components/CalendarHeader";
import { Clock } from "lucide-react";
import ScheduleChangeModal from "@/features/calendar/components/ScheduleChangeModal";

const getCookieValue = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
};

const CalendarPage = () => {
  const router = useRouter();
  const [scheduleData, setScheduleData] = useState<StaffScheduleData | null>(
    null
  );
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const days = ["일", "월", "화", "수", "목", "금", "토"] as const;

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setIsLoading(true);

        const encodedStoreIdList = getCookieValue("storeIdList");
        const userId = getCookieValue("userId");

        if (!encodedStoreIdList || !userId) {
          router.push("/login");
          return;
        }

        const decodedStoreIdList = decodeURIComponent(encodedStoreIdList);
        const storeIdList = JSON.parse(decodedStoreIdList);
        const storeId = storeIdList[0];

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/calendar/${storeId}/select/${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        const responseData: ApiResponse<StaffScheduleData> =
          await response.json();

        if (!responseData.success) {
          if (responseData.code === "C-006") {
            setError("등록된 스케줄이 없습니다.");
            return;
          }
          throw new Error(
            responseData.message || "스케줄을 불러오는데 실패했습니다."
          );
        }

        setScheduleData(responseData.data as StaffScheduleData);

        const schedules = (responseData.data as StaffScheduleData).schedules;
        let minHour = Math.min(
          ...schedules.map((s) => parseInt(s.startTime.split(":")[0]))
        );
        let maxHour = Math.max(
          ...schedules.map((s) => {
            const endHour = parseInt(s.endTime.split(":")[0]);
            return endHour === 0 ? 24 : endHour;
          })
        );

        minHour = Math.max(0, minHour - 1);
        maxHour = Math.min(24, maxHour);

        const slots: TimeSlot[] = Array.from(
          { length: maxHour - minHour + 1 },
          (_, i) => {
            const hour = i + minHour;
            return {
              time:
                hour === 0
                  ? "12"
                  : hour === 12
                  ? "12"
                  : hour > 12
                  ? String(hour - 12)
                  : String(hour),
              format: hour >= 12 ? (hour === 24 ? "AM" : "PM") : "AM",
              originalHour: hour,
            };
          }
        );

        setTimeSlots(slots);
      } catch (error) {
        setError("스케줄을 불러오는데 실패했습니다.");

        if (process.env.NODE_ENV === "development") {
          console.error("스케줄 로딩 실패: ", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  const calculateEventPosition = (hour: number) => {
    const firstHour = timeSlots[0]?.originalHour ?? 0;
    return (hour - firstHour) * 40;
  };

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="h-full">
        <PageTitle />
        <div className="text-gray-600 text-center p-8">{error}</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full">
        <PageTitle />
        <CalendarHeader />
        <CalendarGrid
          days={days}
          timeSlots={timeSlots}
          scheduleData={scheduleData}
          calculateEventPosition={calculateEventPosition}
        />
      </div>

      <div
        className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-white"
        style={{ width: "412px" }}
      >
        <button
          className="w-full flex items-center justify-center gap-2 py-3"
          onClick={() => setIsModalOpen(true)}
        >
          <Clock size={18} />
          근무 변경 요청하기
        </button>
      </div>

      <ScheduleChangeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        scheduleData={scheduleData}
      />
    </>
  );
};

export default CalendarPage;
