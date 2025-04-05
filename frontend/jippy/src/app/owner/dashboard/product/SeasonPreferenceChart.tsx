// app/owner/dashboard/product/SeasonPreferenceChart.tsx
"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Line, Bar } from "react-chartjs-2";
import { ChartData } from "chart.js";
import "chart.js/auto";

interface MonthlySalesItem {
  productId: number;
  productName: string;
  soldCount: number;
}

interface MonthSalesData {
  [monthKey: string]: MonthlySalesItem[];
}

interface FetchMonthResponse {
  code: number;
  success: boolean;
  data: {
    productMonthlySold: MonthSalesData;
  };
}

interface SeasonPreferenceChartProps {
  storeId: number;
}

const TOP_N_PRODUCTS = 10;

const SeasonPreferenceChart: React.FC<SeasonPreferenceChartProps> = ({
  storeId,
}) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [loading, setLoading] = useState(false);
  const [lineChartData, setLineChartData] = useState<ChartData<"line"> | null>(
    null
  );
  const [barChartData, setBarChartData] = useState<ChartData<"bar"> | null>(
    null
  );
  const monthKeys = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ];
  const monthLabels = [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ];

  const fetchMonthData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/product/${storeId}/fetch/month?targetYear=${selectedYear}`
      );
      const json: FetchMonthResponse = await response.json();
      if (json.success) {
        const monthSalesData = json.data.productMonthlySold;
        buildCharts(monthSalesData);
      }
    } catch (error) {
      console.error("Error fetching month data:", error);
    }
    setLoading(false);
  }, [selectedYear, storeId]);

  const buildCharts = (monthSalesData: MonthSalesData) => {
    // 1) 월별 총 판매량 (Line 차트) - 0이면 null 처리
    const monthlyTotals: (number | null)[] = monthKeys.map((key) => {
      const items = monthSalesData[key] || [];
      const sum = items.reduce((acc, cur) => acc + cur.soldCount, 0);
      return sum === 0 ? null : sum;
    });
    const lineData: ChartData<"line"> = {
      labels: monthLabels,
      datasets: [
        {
          label: "월별 총 판매량",
          data: monthlyTotals,
          borderColor: "#10B981",
          backgroundColor: "rgba(16, 185, 129, 0.2)",
          tension: 0.3,
          fill: true,
          spanGaps: true,
        },
      ],
    };
    setLineChartData(lineData);

    // 2) 연간 누적 판매량 상위 상품 (Horizontal Bar 차트)
    const productMap: Record<string, number> = {};
    monthKeys.forEach((key) => {
      const items = monthSalesData[key] || [];
      items.forEach((item) => {
        if (!productMap[item.productName]) {
          productMap[item.productName] = 0;
        }
        productMap[item.productName] += item.soldCount;
      });
    });
    const productArray = Object.entries(productMap).map(([name, total]) => ({
      name,
      total,
    }));
    productArray.sort((a, b) => b.total - a.total);
    const topProducts = productArray.slice(0, TOP_N_PRODUCTS);
    const barData: ChartData<"bar"> = {
      labels: topProducts.map((p) => p.name),
      datasets: [
        {
          label: "판매량",
          data: topProducts.map((p) => p.total),
          backgroundColor: "rgba(99, 102, 241, 0.7)",
        },
      ],
    };
    setBarChartData(barData);
  };

  useEffect(() => {
    fetchMonthData();
  }, [fetchMonthData]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4" style={{ color: "#F27B39" }}>
        상품별 시즌 선호도
      </h2>
      <div className="mb-4 flex items-center gap-4">
        <label className="text-sm font-medium">연도 </label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="border p-1 rounded"
        >
          {Array.from({ length: 2 }, (_, i) => currentYear - i).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <p>차트 로딩중...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded p-4 shadow">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">
              월별 총 주문량
            </h3>
            {lineChartData ? (
              <div style={{ height: "300px" }}>
                <Line
                  data={lineChartData}
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
          <div className="bg-gray-50 rounded p-4 shadow">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">
              연간 판매 상위 {TOP_N_PRODUCTS}개 상품
            </h3>
            {barChartData ? (
              <div style={{ height: "300px" }}>
                <Bar
                  data={barChartData}
                  options={{
                    indexAxis: "y",
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: "top" } },
                    scales: { x: { beginAtZero: true } },
                  }}
                />
              </div>
            ) : (
              <p>데이터가 없습니다.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeasonPreferenceChart;
