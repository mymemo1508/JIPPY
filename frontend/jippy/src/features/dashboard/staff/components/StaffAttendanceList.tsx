"use client";

import React, { useState } from "react";
import StaffAttendanceCard from "./StaffAttendanceCard";
import { ChevronDown } from "lucide-react";
import useStaffList from "../hooks/useStaffManagement";

interface StaffAttendanceListProps {
  storeId: number;
}

const StaffAttendanceList = ({ storeId }: StaffAttendanceListProps) => {
  const { data: staffList, isLoading } = useStaffList(storeId);
  const [openStaffId, setOpenStaffId] = useState<number | null>(null);

  if (isLoading) return null;

  if (staffList) {
    return (
      <div className="w-full overflow-y-auto">
        <div className="space-y-2">
          {staffList.map((staff) => (
            <div
              key={staff.staffId}
              className="border rounded-lg overflow-hidden bg-white"
            >
              <button
                onClick={() =>
                  setOpenStaffId(
                    openStaffId === staff.staffId ? null : staff.staffId
                  )
                }
                className="w-full px-4 py-3 flex justify-between items-center hover:bg-gray-50 transition-colors bg-white border-b"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{staff.staffName}</span>
                  <span
                    className={`mx-2 px-2 py-1 rounded-full text-[12px] ${
                      staff.staffType === "MANAGER"
                        ? "bg-blue-50 text-blue-500"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {staff.staffType === "MANAGER" ? "매니저" : "직원"}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <ChevronDown
                    className={`h-5 w-5 text-gray-500 transition-transform ${
                      openStaffId === staff.staffId
                        ? "transform rotate-180"
                        : ""
                    }`}
                  />
                </div>
              </button>

              {openStaffId === staff.staffId && (
                <div className="p-4">
                  <StaffAttendanceCard
                    storeId={storeId}
                    staffId={staff.staffId}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
};

export default StaffAttendanceList;
