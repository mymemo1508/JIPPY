"use client";

import {
  DAYS_OF_WEEK,
  Schedule,
  StaffScheduleData,
} from "@/features/calendar/types/calendar";
import useStaffSchedule from "../hooks/useStaffSchedule";
import { SCHEDULE_COLORS } from "../types/staff";
import ScheduleCreateModal from "./ScheduleCreateModal";
import { useState } from "react";
import useStaffList from "../hooks/useStaffManagement";
import ScheduleEditModal from "./ScheduleEditModal";
import { Card } from "@/features/common/components/ui/card/Card";

interface WeeklyStaffScheduleProps {
  storeId: number;
}

const WeeklyStaffSchedule = ({ storeId }: WeeklyStaffScheduleProps) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null
  );
  const [selectedStaffName, setSelectedStaffName] = useState<string>("");
  const {
    data: staffSchedules,
    isLoading,
    refreshSchedule,
  } = useStaffSchedule(storeId);
  const { data: staffList } = useStaffList(storeId);

  if (isLoading) return null;

  if (!staffSchedules || staffSchedules.length === 0) {
    return (
      <Card className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[#3D3733]">
              주간 근무 스케줄
            </h2>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-jippy-orange text-white rounded-lg hover:bg-[#D8692E] transition-colors"
            >
              + 스케줄 등록
            </button>
          </div>
          <div className="py-12 flex flex-col items-center justify-center text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mb-4 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-center mb-1">등록된 스케줄이 없습니다.</p>
            <p className="text-sm text-center text-gray-400">
              새로운 스케줄을 등록해주세요.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const handleScheduleClick = (schedule: Schedule, staffName: string) => {
    setSelectedSchedule(schedule);
    setSelectedStaffName(staffName);
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[#3D3733]">
            주간 근무 스케줄
          </h2>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-jippy-orange text-white rounded-lg hover:bg-[#D8692E] transition-colors"
          >
            + 스케줄 등록
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-4">
          {staffSchedules.map((staff: StaffScheduleData, index: number) => (
            <div
              key={staff.storeUserStaffId}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full"
            >
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  SCHEDULE_COLORS.legend[index % SCHEDULE_COLORS.legend.length]
                }`}
              />
              <span className="text-sm text-gray-700">{staff.staffName}</span>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-100">
          <div className="grid grid-cols-7">
            {DAYS_OF_WEEK.map((day: string) => (
              <div
                key={day}
                className="py-2 text-center font-medium border-b border-gray-100 bg-gray-50/50"
                style={{
                  color:
                    day === "일"
                      ? "#FF0000"
                      : day === "토"
                      ? "#0000FF"
                      : "#3D3733",
                }}
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {DAYS_OF_WEEK.map((day: string) => (
              <div
                key={day}
                className="min-h-[120px] p-2 border-r last:border-r-0 border-gray-100"
              >
                {staffSchedules.map(
                  (staff: StaffScheduleData, staffIndex: number) =>
                    staff.schedules
                      .filter(
                        (schedule: Schedule) => schedule.dayOfWeek === day
                      )
                      .map((schedule: Schedule) => (
                        <div
                          key={schedule.calendarId}
                          onClick={() =>
                            handleScheduleClick(schedule, staff.staffName)
                          }
                          className={`${
                            SCHEDULE_COLORS.schedule[
                              staffIndex % SCHEDULE_COLORS.schedule.length
                            ]
                          } rounded-full px-3 py-1 mb-1 text-center cursor-pointer hover:brightness-95 transition-all`}
                        >
                          <span className="text-xs">
                            {schedule.startTime} - {schedule.endTime}
                          </span>
                        </div>
                      ))
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {staffList && (
        <ScheduleCreateModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          storeId={storeId}
          staffList={staffList}
          onSuccess={refreshSchedule}
        />
      )}

      {selectedSchedule && (
        <ScheduleEditModal
          isOpen={!!selectedSchedule}
          onClose={() => setSelectedSchedule(null)}
          storeId={storeId}
          schedule={selectedSchedule}
          staffName={selectedStaffName}
          onSuccess={refreshSchedule}
        />
      )}
    </Card>
  );
};

export default WeeklyStaffSchedule;
