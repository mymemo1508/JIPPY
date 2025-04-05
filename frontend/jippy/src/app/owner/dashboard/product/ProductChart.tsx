// app/owner/dashboard/product/ProductChart.tsx
"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Bar } from "react-chartjs-2";
import { ChartData } from "chart.js";
import "chart.js/auto";

type ProductChartProps = {
  storeId: number;
};

type ProductSalesItem = {
  name: string;
  totalSold: number;
};

const ProductChart: React.FC<ProductChartProps> = ({ storeId }) => {
  const [viewType, setViewType] = useState<"recent" | "monthly">("recent");
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    String(new Date().getMonth() + 1).padStart(2, "0")
  );
  const [chartData, setChartData] = useState<ChartData<"bar"> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchRecentData = useCallback(async () => {
    setLoading(true);
    try {
      const today = new Date();
      const startDate = new Date();
      startDate.setDate(today.getDate() - 30);
      const startStr = startDate.toISOString().slice(0, 7); // yyyy-MM
      const endStr = today.toISOString().slice(0, 7);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/product/${storeId}/fetch/all?startDate=${startStr}&endDate=${endStr}`
      );
      const jsonResponse = await response.json();
      if (
        jsonResponse &&
        jsonResponse.success &&
        jsonResponse.data &&
        jsonResponse.data.productSoldInfo
      ) {
        const productSales: ProductSalesItem[] =
          jsonResponse.data.productSoldInfo;
        const labels = productSales.map((item) => item.name);
        const salesData = productSales.map((item) => item.totalSold);
        setChartData({
          labels,
          datasets: [
            {
              label: "최근 30일 판매량",
              data: salesData,
              backgroundColor: "#F27B39",
              borderColor: "#F27B39",
              borderWidth: 1,
              hoverBackgroundColor: "#D35F1D",
              borderRadius: 8,
              barThickness: "flex",
            },
          ],
        });
      }
    } catch (error) {
      console.error("Error fetching recent data:", error);
    }
    setLoading(false);
  }, [storeId]);

  const fetchMonthlyData = useCallback(async () => {
    setLoading(true);
    try {
      const startDate = `${selectedYear}-${selectedMonth}`; // yyyy-MM
      const endDate = startDate;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/product/${storeId}/fetch/all?startDate=${startDate}&endDate=${endDate}`
      );
      const jsonResponse = await response.json();
      if (
        jsonResponse &&
        jsonResponse.success &&
        jsonResponse.data &&
        jsonResponse.data.productSoldInfo
      ) {
        const productSales: ProductSalesItem[] =
          jsonResponse.data.productSoldInfo;
        const labels = productSales.map((item) => item.name);
        const salesData = productSales.map((item) => item.totalSold);
        setChartData({
          labels,
          datasets: [
            {
              label: `판매량 (${selectedYear}-${selectedMonth})`,
              data: salesData,
              backgroundColor: "#F27B39",
              borderColor: "#F27B39",
              borderWidth: 1,
            },
          ],
        });
      }
    } catch (error) {
      console.error("Error fetching monthly data:", error);
    }
    setLoading(false);
  }, [storeId, selectedYear, selectedMonth]);

  useEffect(() => {
    if (viewType === "recent") {
      fetchRecentData();
    } else {
      fetchMonthlyData();
    }
  }, [
    storeId,
    viewType,
    selectedYear,
    selectedMonth,
    fetchRecentData,
    fetchMonthlyData,
  ]);

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-4">
        <h2 className="text-2xl font-bold" style={{ color: "#F27B39" }}>
          {viewType === "recent" ? "최근 30일 판매량" : "월별 판매량"}
        </h2>
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 mt-2 sm:mt-0">
          {/* 📌 월별 옵션 선택 (연도 & 월) */}
          {viewType === "monthly" && (
            <div className="flex gap-3 mr-4">
              {/* 연도 선택 */}
              <select
                value={selectedYear}
                onChange={(e) => {
                  const newYear = parseInt(e.target.value);
                  setSelectedYear(newYear);

                  if (newYear === 2025 && parseInt(selectedMonth) > 2) {
                    setSelectedMonth("02");
                  }
                }}
                className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F27B39] transition-all"
              >
                {Array.from({ length: 2 }, (_, i) => currentYear - i).map(
                  (year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  )
                )}
              </select>

              {/* 월 선택 */}
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F27B39] transition-all"
              >
                {[
                  { value: "01", label: "1월" },
                  { value: "02", label: "2월" },
                  { value: "03", label: "3월" },
                  { value: "04", label: "4월" },
                  { value: "05", label: "5월" },
                  { value: "06", label: "6월" },
                  { value: "07", label: "7월" },
                  { value: "08", label: "8월" },
                  { value: "09", label: "9월" },
                  { value: "10", label: "10월" },
                  { value: "11", label: "11월" },
                  { value: "12", label: "12월" },
                ]
                  .filter(
                    (m) => selectedYear !== 2025 || parseInt(m.value) <= 2
                  )
                  .map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* 📌 토글 버튼 스타일 */}
          <div className="flex bg-gray-200 rounded-full p-1">
            <button
              onClick={() => setViewType("recent")}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                viewType === "recent"
                  ? "bg-[#F27B39] text-white shadow-md"
                  : "text-gray-600"
              }`}
            >
              최근 30일
            </button>
            <button
              onClick={() => setViewType("monthly")}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                viewType === "monthly"
                  ? "bg-[#F27B39] text-white shadow-md"
                  : "text-gray-600"
              }`}
            >
              월별
            </button>
          </div>
        </div>
      </div>
      {loading ? (
        <p>차트를 불러오는 중...</p>
      ) : chartData ? (
        <div className="h-80">
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: "top" } },
              scales: { y: { beginAtZero: true } },
            }}
          />
        </div>
      ) : (
        <p>데이터가 없습니다.</p>
      )}
    </div>
  );
};

export default ProductChart;
