"use client";

import { Card } from "@/features/common/components/ui/card/Card";
import { useWorkingStaff } from "../hooks/useStaffStatistic";
import { Users } from "lucide-react";

interface WorkingStaffCardProps {
  storeId: number;
}

const WorkingStaffCard = ({ storeId }: WorkingStaffCardProps) => {
  const { data, isLoading } = useWorkingStaff(storeId);

  if (isLoading) return null;

  if (data) {
    return (
      <Card className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[#3D3733]">
              실시간 출근 현황
            </h2>
            <Users className="w-5 h-5 text-jippy-orange" />
          </div>

          <div className="mb-4">
            <p className="text-3xl font-bold text-[#3D3733]">
              {data.totalCount}명
            </p>
            <p className="text-sm text-gray-600 mt-1">현재 근무 중</p>
          </div>

          {data.staffList.length > 0 && (
            <div className="space-y-2">
              {data.staffList.map((staff) => (
                <div
                  key={staff.storeUserStaffId}
                  className="text-[15px] text-gray-700"
                >
                  {staff.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    );
  }
};

export default WorkingStaffCard;
