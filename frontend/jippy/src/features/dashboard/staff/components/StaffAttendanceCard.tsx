"use client";

import React, { useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import LoadingSpinner from "@/features/common/components/ui/LoadingSpinner";
import { useStaffStatus } from "../hooks/useStaffStatistic";
import { StaffMonthlyStatus, StaffTotalStatus } from "../types/staff";

interface StaffAttendanceCardProps {
  storeId: number;
  staffId: number;
}

interface AttendanceStatsProps {
  data: StaffMonthlyStatus | StaffTotalStatus;
  isTotal: boolean;
}

type TabType = "monthly" | "total";

const StaffAttendanceCard = ({
  storeId,
  staffId,
}: StaffAttendanceCardProps) => {
  const { monthlyStats, totalStats } = useStaffStatus(storeId, staffId);
  const [selectedTab, setSelectedTab] = useState<TabType>("monthly");

  if (monthlyStats.isLoading || totalStats.isLoading) return <LoadingSpinner />;
  if (monthlyStats.error || totalStats.error) return null;
  if (!monthlyStats.data || !totalStats.data) return null;

  const formatWorkTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0
      ? `${hours}시간 ${remainingMinutes}분`
      : `${remainingMinutes}분`;
  };

  const AttendanceStats = ({ data, isTotal }: AttendanceStatsProps) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">근무 시간</p>
          <p className="text-xl font-bold text-blue-700">
            {formatWorkTime(
              isTotal
                ? (data as StaffTotalStatus).totalWorkMinutes
                : (data as StaffMonthlyStatus).workMinutes
            )}
          </p>
        </div>
        <div className="bg-emerald-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            {isTotal ? "총 급여" : "이번 달 급여"}
          </p>
          <p className="text-xl font-bold text-emerald-700">
            {(isTotal
              ? (data as StaffTotalStatus).totalSalary
              : (data as StaffMonthlyStatus).salary
            ).toLocaleString()}
            원
          </p>
        </div>
      </div>

      <div className="bg-red-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <p className="text-sm text-gray-600">근태 이슈</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <p className="text-sm">
            지각{" "}
            <span className="text-lg font-bold text-red-600">
              {isTotal
                ? (data as StaffTotalStatus).totalLateCount
                : (data as StaffMonthlyStatus).lateCount}
            </span>
            회
          </p>
          <p className="text-sm">
            조기퇴근{" "}
            <span className="text-lg font-bold text-red-600">
              {isTotal
                ? (data as StaffTotalStatus).totalEarlyLeaveCount
                : (data as StaffMonthlyStatus).earlyLeaveCount}
            </span>
            회
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">근태 현황</h2>
          <Clock className="w-5 h-5 text-gray-500" />
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-2 mb-4 bg-gray-100 p-1 rounded-lg">
          <button
            className={`py-2 px-4 rounded-md transition-colors ${
              selectedTab === "monthly"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:bg-gray-50"
            }`}
            onClick={() => setSelectedTab("monthly")}
          >
            이번 달
          </button>
          <button
            className={`py-2 px-4 rounded-md transition-colors ${
              selectedTab === "total"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:bg-gray-50"
            }`}
            onClick={() => setSelectedTab("total")}
          >
            누적
          </button>
        </div>

        {selectedTab === "monthly" ? (
          <AttendanceStats data={monthlyStats.data} isTotal={false} />
        ) : (
          <AttendanceStats data={totalStats.data} isTotal={true} />
        )}
      </div>
    </div>
  );
};

export default StaffAttendanceCard;
