"use client";

import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
} from "recharts";
import { useStaffPerformance } from "../hooks/useStaffStatistic";
import { Card } from "@/features/common/components/ui/card/Card";
import { BarChart3 } from "lucide-react";

interface StaffPerformanceCardProps {
  storeId: number;
}

interface ChartData {
  id: number;
  name: string;
  value: number;
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{
    payload: ChartData;
  }>;
}

const COLORS = [
  "#FF5C00",
  "#FF8C40",
  "#FFBD80",
  "#FFDEBF",
  "#FFF0E6",
  "#FFD700",
  "#E6B800",
  "#FFF5CC",
  "#D4946B",
  "#F1C694",
  "#8B4513",
  "#A0522D",
  "#CD853F",
];

const StaffPerformanceCard = ({ storeId }: StaffPerformanceCardProps) => {
  const { isLoading, monthlySales } = useStaffPerformance(storeId);
  const [selectedStaff, setSelectedStaff] = useState<number | null>(null);

  if (isLoading) return null;

  if (!monthlySales.length) {
    return (
      <Card className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-[#3D3733] mb-4">
            직원별 매출
          </h2>
          <div className="py-12 flex flex-col items-center justify-center text-gray-500">
            <BarChart3 className="h-12 w-12 mb-4 text-gray-300" />
            <p className="text-center mb-1">매출 데이터가 없습니다.</p>
          </div>
        </div>
      </Card>
    );
  }

  const lastMonth = monthlySales[0];
  const chartData: ChartData[] = lastMonth.staffSales
    .sort((a, b) => b.earnSales - a.earnSales)
    .map((staff) => ({
      id: staff.staffId,
      name: staff.staffName,
      value: staff.earnSales,
    }));

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border rounded shadow">
          <p className="font-medium">{data.name}</p>
          <p className="text-[#ff5c00]">{data.value.toLocaleString()}원</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 h-full flex flex-col">
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-[#3D3733]">
              {lastMonth.yearMonth} 직원별 매출
            </h2>
            <span className="ml-2 px-2 py-1 bg-[#F27B39]/10 text-[#F27B39] rounded-full text-[15px]">
              {lastMonth.totalSales.toLocaleString()}원
            </span>
          </div>
          <BarChart3 className="w-5 h-5 text-gray-400" />
        </div>

        <div className="flex flex-1 flex-col items-center">
          <div className="w-full flex justify-center mb-4">
            <div className="w-3/5 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    onMouseEnter={(data) => setSelectedStaff(data.id)}
                    onMouseLeave={() => setSelectedStaff(null)}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        style={{
                          filter:
                            selectedStaff === entry.id
                              ? "brightness(0.9)"
                              : undefined,
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="w-full max-h-[180px] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {chartData.map((staff, index) => (
                <div
                  key={staff.id}
                  className={`p-3 rounded-lg flex items-center gap-3 cursor-pointer transition-colors ${
                    selectedStaff === staff.id
                      ? "bg-[#F27B39]/10"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                  onMouseEnter={() => setSelectedStaff(staff.id)}
                  onMouseLeave={() => setSelectedStaff(null)}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{staff.name}</p>
                    <p className="text-sm text-gray-600">
                      {staff.value.toLocaleString()}원
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StaffPerformanceCard;
