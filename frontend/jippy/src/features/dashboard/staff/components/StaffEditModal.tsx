"use client";

import { useEffect, useState } from "react";
import {
  SalaryType,
  StaffInfo,
  UpdateableStaffType,
  UpdateStaffRequest,
} from "../types/staff";
import { X } from "lucide-react";

interface StaffEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffInfo;
  onUpdate: (staffId: number, data: UpdateStaffRequest) => Promise<void>;
  onDelete: (staffId: number) => Promise<void>;
}

const StaffEditModal = ({
  isOpen,
  onClose,
  staff,
  onUpdate,
  onDelete,
}: StaffEditModalProps) => {
  const [staffType, setStaffType] = useState<UpdateableStaffType>(
    staff.staffType === "OWNER" ? "STAFF" : staff.staffType
  );
  const [salary, setSalary] = useState(staff.staffSalary);
  const [salaryType, setSalaryType] = useState<SalaryType>(
    staff.staffSalaryType
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setStaffType(staff.staffType === "OWNER" ? "STAFF" : staff.staffType);
    setSalary(staff.staffSalary);
    setSalaryType(staff.staffSalaryType);
  }, [staff]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const updates: UpdateStaffRequest = {};
    if (staffType !== staff.staffType) updates.staffType = staffType;
    if (salary !== staff.staffSalary) updates.staffSalary = salary;
    if (salaryType !== staff.staffSalaryType)
      updates.staffSalaryType = salaryType;

    try {
      await onUpdate(staff.staffId, updates);
      onClose();
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "삭제된 직원은 복구할 수 없습니다.\n정말 삭제하시겠습니까?"
      )
    )
      return;

    setIsLoading(true);
    try {
      await onDelete(staff.staffId);
      onClose();
    } catch (error) {
      console.error("Failed to delete staff:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[#3D3733]">
            직원 정보 수정
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">이름</label>
              <input
                type="text"
                value={staff.staffName}
                disabled
                className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                직원 유형
              </label>
              <select
                value={staffType}
                onChange={(e) =>
                  setStaffType(e.target.value as UpdateableStaffType)
                }
                className="w-full p-2 border rounded appearance-none bg-[length:15px] bg-[center_right_0.6rem] bg-no-repeat bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCA2TDggMTBMMTIgNiIgc3Ryb2tlPSIjNjY2NjY2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')]"
                disabled={staff.staffType === "OWNER" || isLoading}
              >
                <option value="STAFF">일반 직원</option>
                <option value="MANAGER">매니저</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">급여</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={salary}
                onChange={(e) => {
                  const value = e.target.value.replace(/^0+(\d)/, "$1");
                  const numberValue = Number(value);
                  if (!isNaN(numberValue) && numberValue >= 0) {
                    setSalary(numberValue);
                  }
                }}
                className="w-full p-2 border rounded font-normal text-base leading-normal"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                급여 유형
              </label>
              <select
                value={salaryType}
                onChange={(e) => setSalaryType(e.target.value as SalaryType)}
                className="w-full p-2 border rounded appearance-none bg-[length:15px] bg-[center_right_0.6rem] bg-no-repeat bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCA2TDggMTBMMTIgNiIgc3Ryb2tlPSIjNjY2NjY2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')]"
                disabled={isLoading}
              >
                <option value="시급">시급</option>
                <option value="월급">월급</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <button
              type="submit"
              className="w-full py-2.5 bg-jippy-orange text-white font-medium rounded hover:bg-[#D8692E] transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              저장
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="w-full py-2.5 text-red-600 font-medium rounded border border-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              직원 삭제
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffEditModal;
