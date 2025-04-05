"use client";

import { useEffect, useState } from "react";
import staffApi from "../hooks/staffApi";
import { Card } from "@/features/common/components/ui/card/Card";
import { Wallet } from "lucide-react";

interface StoreSalaryCardProps {
  storeId: number;
}

const StoreSalaryCard = ({ storeId }: StoreSalaryCardProps) => {
  const [lastMonthSalary, setLastMonthSalary] = useState<number | null>(null);
  const [currentMonthSalary, setCurrentMonthSalary] = useState<number | null>(
    null
  );
  const [totalSalary, setTotalSalary] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSalaryData = async () => {
      try {
        setIsLoading(true);

        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;

        const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const lastMonthYear =
          currentMonth === 1 ? currentYear - 1 : currentYear;

        const currentMonthStr = `${currentYear}-${String(currentMonth).padStart(
          2,
          "0"
        )}`;
        const lastMonthStr = `${lastMonthYear}-${String(lastMonth).padStart(
          2,
          "0"
        )}`;

        const [lastMonthData, currentMonthData, totalData] = await Promise.all([
          staffApi.getStoreSalary(storeId, lastMonthStr),
          staffApi.getStoreSalary(storeId, currentMonthStr),
          staffApi.getTotalStoreSalary(storeId),
        ]);

        if (
          lastMonthData.success &&
          currentMonthData.success &&
          totalData.success
        ) {
          setLastMonthSalary(lastMonthData.data.storeSalary);
          setCurrentMonthSalary(currentMonthData.data.storeSalary);
          setTotalSalary(totalData.data.totalStoreSalary);
        } else {
          throw new Error("데이터 조회에 실패했습니다.");
        }
      } catch (error) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    };

    fetchSalaryData();
  }, [storeId]);

  if (isLoading) return null;

  if (!lastMonthSalary && !currentMonthSalary && !totalSalary) {
    return (
      <Card className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-[#3D3733] mb-4">
            매장 인건비 현황
          </h2>
          <div className="py-12 flex flex-col items-center justify-center text-gray-500">
            <Wallet className="h-12 w-12 mb-4 text-gray-300" />
            <p className="text-center mb-1">인건비 정보가 없습니다.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-[#3D3733] mb-6">
          매장 인건비 현황
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm text-gray-500 mb-2">저번 달 인건비</h3>
            <p className="text-lg font-semibold">
              {lastMonthSalary?.toLocaleString()}원
            </p>
          </div>
          <div className="bg-[#F27B39]/5 rounded-lg p-4">
            <h3 className="text-sm text-gray-500 mb-2">이번 달 인건비</h3>
            <p className="text-lg font-semibold text-jippy-orange">
              {currentMonthSalary?.toLocaleString()}원
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm text-gray-500 mb-2">누적 인건비</h3>
            <p className="text-lg font-semibold">
              {totalSalary?.toLocaleString()}원
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StoreSalaryCard;
