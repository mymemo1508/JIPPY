import React, { useState } from "react";
import { StaffScheduleData } from "../types/calendar";
import { useRouter } from "next/navigation";

interface Schedule {
  id: string;
  dayOfWeek: string;
  day: string;
  time: string;
  startTime: string;
  endTime: string;
}

interface ScheduleChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleData: StaffScheduleData | null;
}

const getCookieValue = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
};

const ScheduleChangeModal: React.FC<ScheduleChangeModalProps> = ({
  isOpen,
  onClose,
  scheduleData,
}) => {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null
  );
  const [originalDate, setOriginalDate] = useState<string>("");
  const [newSchedule, setNewSchedule] = useState({
    date: "",
    startTime: "",
    endTime: "",
  });

  const schedules =
    scheduleData?.schedules.map((schedule) => ({
      id: schedule.dayOfWeek.toString(),
      dayOfWeek: schedule.dayOfWeek.toString(),
      day: schedule.dayOfWeek,
      time: `${schedule.startTime}-${schedule.endTime}`,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    })) || [];

  const days = ["일", "월", "화", "수", "목", "금", "토"] as const;

  const handleDateChange = (date: string) => {
    setOriginalDate(date);
    const dayIndex = new Date(date).getDay();
    const dayName = days[dayIndex];
    const schedule = schedules.find((s) => s.dayOfWeek === dayName);

    if (schedule) {
      setSelectedSchedule(schedule);
      setNewSchedule({
        date: date,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
      });
    } else {
      setSelectedSchedule(null);
    }
  };

  const handleNewScheduleChange = (
    field: "date" | "startTime" | "endTime",
    value: string
  ) => {
    setNewSchedule((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const submitScheduleChange = async () => {
    try {
      setIsSubmitting(true);

      const encodedStoreIdList = getCookieValue("storeIdList");
      const userId = getCookieValue("userId");

      if (!encodedStoreIdList || !userId) {
        router.push("/login");
        return;
      }

      const decodedStoreIdList = decodeURIComponent(encodedStoreIdList);
      const storeIdList = JSON.parse(decodedStoreIdList);
      const storeId = storeIdList[0];

      const requestData = {
        beforeYear: originalDate,
        beforeCheckIn: selectedSchedule?.startTime || "",
        beforeCheckOut: selectedSchedule?.endTime || "",
        newYear: newSchedule.date,
        newCheckIn: newSchedule.startTime,
        newCheckOut: newSchedule.endTime,
      };

      console.log("변경 요청 body", requestData);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/attendance/${storeId}/tempChange/${userId}/request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
          credentials: "include",
        }
      );

      console.log("변경 요청 응답", response);

      if (!response.ok) {
        throw new Error("근무 변경 요청에 실패했습니다.");
      }

      alert("근무 변경 요청이 성공적으로 전송되었습니다.");
      handleClose();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "근무 변경 요청에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async (): Promise<void> => {
    if (step === 1 && selectedSchedule) {
      setStep(2);
    } else if (step === 2) {
      await submitScheduleChange();
    }
  };

  const handleClose = (): void => {
    setStep(1);
    setSelectedSchedule(null);
    setOriginalDate("");
    setNewSchedule({
      date: "",
      startTime: "",
      endTime: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium">근무 시간 변경 요청</h2>
        </div>

        <div className="px-6 py-4">
          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  변경할 날짜
                </label>

                <input
                  type="date"
                  className="w-full"
                  value={originalDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                />
              </div>
              {originalDate && !selectedSchedule && (
                <div className="text-sm text-red-500">
                  선택한 날짜에 근무 일정이 없습니다.
                </div>
              )}
              {selectedSchedule && (
                <div className="text-sm text-gray-500">
                  현재 근무 시간: {selectedSchedule.day}요일{" "}
                  {selectedSchedule.time}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  변경 희망일
                </label>
                <input
                  type="date"
                  className="w-full"
                  value={newSchedule.date}
                  onChange={(e) =>
                    handleNewScheduleChange("date", e.target.value)
                  }
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">
                    시작 시간
                  </label>
                  <input
                    type="time"
                    className="w-full"
                    value={newSchedule.startTime}
                    onChange={(e) =>
                      handleNewScheduleChange("startTime", e.target.value)
                    }
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">
                    종료 시간
                  </label>
                  <input
                    type="time"
                    className="w-full"
                    value={newSchedule.endTime}
                    onChange={(e) =>
                      handleNewScheduleChange("endTime", e.target.value)
                    }
                  />
                </div>
              </div>
              {selectedSchedule && (
                <div className="text-sm text-gray-500">
                  현재 근무 시간: {selectedSchedule.day}요일{" "}
                  {selectedSchedule.time}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t flex justify-end gap-2">
          <button
            onClick={handleClose}
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handleNext}
            disabled={(step === 1 && !selectedSchedule) || isSubmitting}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:hover:bg-orange-500"
          >
            {isSubmitting ? "처리 중..." : step === 1 ? "다음" : "요청하기"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleChangeModal;
