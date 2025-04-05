"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import { useEffect, useState } from "react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface LowStockItem {
  stockName: string;
  soldPercentage: number;
  remainingStock: number;
}

const LowStockChart = () => {
  const [lowStockData, setLowStockData] = useState<LowStockItem[]>([]);

  useEffect(() => {
    async function fetchLowStock() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/stock-status/1/select`,
          { cache: "no-store" }
        );
        const json = await response.json();
        setLowStockData(json.data.lowStockList || []);
      } catch (error) {
        console.error("저재고 데이터를 불러오지 못했습니다.", error);
      }
    }
    fetchLowStock();
  }, []);

  const labels = lowStockData.map((item) => item.stockName);
  const soldData = lowStockData.map((item) => item.soldPercentage);
  const remainingData = lowStockData.map((item) => item.remainingStock);

  const data: ChartData<"bar", number[], string> = {
    labels,
    datasets: [
      {
        label: "판매율 (%)",
        data: soldData,
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "남은 재고",
        data: remainingData,
        backgroundColor: "rgba(54, 162, 235, 0.5)",
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    indexAxis: "y", // 수평 바 차트
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "재고 부족 현황",
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
      legend: {
        position: "bottom",
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div style={{ height: "400px" }}>
      <Chart type="bar" data={data} options={options} />
    </div>
  );
};

export default LowStockChart;
