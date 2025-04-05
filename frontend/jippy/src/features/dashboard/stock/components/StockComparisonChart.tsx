"use client";

import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import type { ChartData } from "chart.js";
import { Loader2 } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface ComparisonDataset {
  name: string;
  data: number[];
}

interface ComparisonAccuracyMetrics {
  mape: number;
  correlation: number;
}

interface ComparisonStatistics {
  total_actual: number;
  total_predicted: number;
  accuracy_metrics: ComparisonAccuracyMetrics;
}

interface ComparisonDataItem {
  date: string;
  actual: number;
  predicted: number;
  difference: number;
  difference_percentage: number;
}

interface ComparisonResponse {
  status: string;
  message: string;
  data: {
    labels: string[];
    datasets: ComparisonDataset[];
    statistics: ComparisonStatistics;
    comparison_data: ComparisonDataItem[];
  };
}

const getCookieValue = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

const StockComparisonChart = () => {
  const [chartData, setChartData] = useState<
    ChartData<"bar" | "line", number[], string> | null
  >(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchComparisonData() {
      try {
        const encodedStoreIdList = getCookieValue('storeIdList');

        if (!encodedStoreIdList) {
          console.error('storeIdList 쿠키를 찾을 수 없습니다.');
          return;
        }

        const decodedStoreIdList = decodeURIComponent(encodedStoreIdList);
        const storeIdList = JSON.parse(decodedStoreIdList);
        const storeId = storeIdList[0];

        const response = await fetch(
          `https://jippy.duckdns.org/stock-ml/api/${storeId}/stock/comparison`,
          { cache: "no-store" }
        );
        const json = (await response.json()) as ComparisonResponse;
        const labels = json.data.labels;
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 30);

        const filteredIndices: number[] = [];
        const filteredLabels: string[] = [];
        labels.forEach((dateStr, index) => {
          const dateObj = new Date(dateStr);
          if (dateObj >= cutoff) {
            filteredIndices.push(index);
            filteredLabels.push(dateStr);
          }
        });

        const filterData = (data: number[]) =>
          data.filter((_, index) => filteredIndices.includes(index));

        const actualDataset = json.data.datasets.find((ds) => ds.name === "실제 판매량");
        const predictedDataset = json.data.datasets.find((ds) => ds.name === "예측 판매량");

        const data: ChartData<"bar" | "line", number[], string> = {
          labels: filteredLabels,
          datasets: [
            {
              label: "최근 30일 실제 판매량",
              data: actualDataset ? filterData(actualDataset.data) : [],
              type: "bar",
              backgroundColor: "rgba(54, 162, 235, 0.5)",
            },
            {
              label: "최근 30일 예측 판매량",
              data: predictedDataset ? filterData(predictedDataset.data) : [],
              type: "line",
              borderColor: "rgba(255, 99, 132, 1)",
              backgroundColor: "rgba(255, 99, 132, 0.5)",
              fill: false,
              tension: 0.3,
            },
          ],
        };
        setChartData(data);
      } catch (error) {
        console.error("최근 30일 비교 데이터 호출 오류:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchComparisonData();
  }, []);

  const options: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "최근 30일 재고 비교",
      },
      legend: {
        position: "bottom" as const,
        labels: {
          boxWidth: 15,
          font: { size: 10 },
          padding: 10,
        },
      },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  const containerStyle = "h-96 bg-white rounded-lg shadow p-4";

  return (
    <div className={containerStyle}>
      {loading ? (
        <div className="h-full flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          <p className="text-gray-500 font-medium">최근 30일 비교 데이터를 불러오는 중...</p>
        </div>
      ) : chartData ? (
        <Chart
          type="bar"
          data={chartData as unknown as ChartData<"bar", number[], string>}
          options={options}
        />
      ) : (
        <div className="h-full flex items-center justify-center">
          <p className="text-gray-500 font-medium">데이터가 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default StockComparisonChart;