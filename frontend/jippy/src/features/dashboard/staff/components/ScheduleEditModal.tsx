"use client";

import { useState } from "react";
import { DAYS_OF_WEEK, Schedule } from "@/features/calendar/types/calendar";
import staffApi from "../hooks/staffApi";

interface ScheduleEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: number;
  schedule: Schedule;
  staffName: string;
  onSuccess: () => void;
}

const ScheduleEditModal = ({
  isOpen,
  onClose,
  storeId,
  schedule,
  staffName,
  onSuccess,
}: ScheduleEditModalProps) => {
  const [dayOfWeek, setDayOfWeek] = useState(schedule.dayOfWeek);
  const [startTime, setStartTime] = useState(schedule.startTime);
  const [endTime, setEndTime] = useState(schedule.endTime);

  if (!isOpen) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await staffApi.updateSchedule(storeId, schedule.calendarId, {
        dayOfWeek,
        startTime,
        endTime,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("스케줄 수정 실패:", error);
      alert("스케줄 수정에 실패했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!confirm("정말 이 스케줄을 삭제하시겠습니까?")) return;

    try {
      await staffApi.deleteSchedule(storeId, schedule.calendarId);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("스케줄 삭제 실패:", error);
      alert("스케줄 삭제에 실패했습니다.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[480px]">
        <h2 className="text-xl font-semibold mb-6 text-[#3D3733]">
          {staffName}님의 스케줄 수정
        </h2>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              요일
            </label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 appearance-none
                bg-[length:15px] bg-[center_right_0.6rem] bg-no-repeat bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCA2TDggMTBMMTIgNiIgc3Ryb2tlPSIjNjY2NjY2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')]"
              required
            >
              {DAYS_OF_WEEK.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                시작 시간
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                종료 시간
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              삭제
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-jippy-orange text-white rounded-lg hover:bg-[#D8692E]"
              >
                수정
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleEditModal;
