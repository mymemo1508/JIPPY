"use client";

import useStaffList from "@/features/dashboard/staff/hooks/useStaffManagement";
import { Users } from "lucide-react";
import { StaffInfo, UpdateStaffRequest } from "../types/staff";
import { useState } from "react";
import staffApi from "../hooks/staffApi";
import StaffEditModal from "./StaffEditModal";
import { Card } from "@/features/common/components/ui/card/Card";
import StaffAttendanceList from "./StaffAttendanceList";

interface StaffListCardProps {
  storeId: number;
}

interface FilterTabProps {
  currentFilter: "update" | "attendance";
  onFilterChange: (filter: "update" | "attendance") => void;
}

const FilterTabs = ({ currentFilter, onFilterChange }: FilterTabProps) => (
  <div className="flex gap-6 mb-6">
    <button
      onClick={() => onFilterChange("update")}
      className={`transition-colors ${
        currentFilter === "update"
          ? "text-jippy-orange font-semibold border-b-2 border-[#F27B39] pb-1"
          : "text-gray-500 hover:text-gray-700"
      }`}
    >
      직원 목록
    </button>
    <button
      onClick={() => onFilterChange("attendance")}
      className={`transition-colors ${
        currentFilter === "attendance"
          ? "text-jippy-orange font-semibold border-b-2 border-[#F27B39] pb-1"
          : "text-gray-500 hover:text-gray-700"
      }`}
    >
      근태 현황
    </button>
  </div>
);

const StaffListCard = ({ storeId }: StaffListCardProps) => {
  const { data: staffList, isLoading, refreshList } = useStaffList(storeId);
  const [currentFilter, setCurrentFilter] = useState<"update" | "attendance">(
    "update"
  );
  const [selectedStaff, setSelectedStaff] = useState<StaffInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isLoading) return null;

  const handleFilterChange = (newFilter: "update" | "attendance") => {
    setCurrentFilter(newFilter);
    setSelectedStaff(null);
  };

  const handleStaffClick = (staff: StaffInfo) => {
    setSelectedStaff(staff);
    setIsModalOpen(true);
  };

  const handleUpdateStaff = async (
    staffId: number,
    updates: UpdateStaffRequest
  ) => {
    try {
      await staffApi.updateStaff(storeId, staffId, updates);
      refreshList();
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteStaff = async (staffId: number) => {
    try {
      await staffApi.deleteStaff(storeId, staffId);
      refreshList();
    } catch (error) {
      throw error;
    }
  };

  const getStaffTypeDisplay = (type: string) => {
    switch (type) {
      case "MANAGER":
        return "매니저";
      case "STAFF":
        return "직원";
      default:
        return type;
    }
  };

  if (!staffList || staffList.length === 0) {
    return (
      <Card className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-[#3D3733] mb-4">
            직원 관리
          </h2>
          <FilterTabs
            currentFilter={currentFilter}
            onFilterChange={handleFilterChange}
          />
          {currentFilter === "update" ? (
            <div className="py-12 flex flex-col items-center justify-center text-gray-500">
              <Users className="h-12 w-12 mb-4 text-gray-300" />
              <p className="text-center mb-1">등록된 직원이 없습니다.</p>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-gray-500">
              <Users className="h-12 w-12 mb-4 text-gray-300" />
              <p className="text-center mb-1">등록된 직원이 없습니다.</p>
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 h-full flex flex-col">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#3D3733]">직원 관리</h2>
          {currentFilter === "update" && (
            <div className="flex items-center gap-2">
              <span className="mr-2 px-2 py-1 bg-[#F27B39]/10 text-[#F27B39] rounded-full text-[15px]">
                총 {staffList.length}명
              </span>
              <Users className="w-5 h-5 text-gray-400" />
            </div>
          )}
        </div>
        <FilterTabs
          currentFilter={currentFilter}
          onFilterChange={handleFilterChange}
        />
        {currentFilter === "update" ? (
          <div className="overflow-x-auto">
            <div className="max-h-[550px] overflow-y-auto pr-2">
              <table className="w-full">
                <thead className="sticky top-0 bg-white z-10 shadow-[0px_1px_0px_0px_rgba(0,0,0,0.1)]">
                  <tr>
                    <th className="py-3 text-left text-[15px] font-medium text-gray-500 pl-2">
                      이름
                    </th>
                    <th className="py-3 text-left text-[15px] font-medium text-gray-500">
                      직원 구분
                    </th>
                    <th className="py-3 text-right text-[15px] font-medium text-gray-500">
                      급여
                    </th>
                    <th className="py-3 text-right text-[15px] font-medium text-gray-500 pr-2">
                      급여 타입
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {staffList.map((staff) => (
                    <tr
                      key={staff.staffId}
                      onClick={() => handleStaffClick(staff)}
                      className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors cursor-pointer"
                    >
                      <td className="py-4 font-medium pl-2">
                        {staff.staffName}
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-2 py-1 rounded-full ${
                            staff.staffType === "MANAGER"
                              ? "bg-blue-50 text-blue-500"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {getStaffTypeDisplay(staff.staffType)}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        {staff.staffSalary.toLocaleString()}원
                      </td>
                      <td className="py-4 text-right pr-2">
                        {staff.staffSalaryType}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="max-h-[550px] overflow-y-auto pr-2">
            <StaffAttendanceList storeId={storeId} />
          </div>
        )}
      </div>

      {selectedStaff && (
        <StaffEditModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          staff={selectedStaff}
          onUpdate={handleUpdateStaff}
          onDelete={handleDeleteStaff}
        />
      )}
    </Card>
  );
};

export default StaffListCard;
