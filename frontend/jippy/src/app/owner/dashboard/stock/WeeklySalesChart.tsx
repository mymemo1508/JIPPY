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
// react-chartjs-2에서는 Chart만 export합니다.
import { Chart } from "react-chartjs-2";
import type { ChartData } from "chart.js";

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

interface WeeklyDataset {
  name: string;
  data: number[];
}

interface WeeklyPredictionResponse {
  status: string;
  message: string;
  data: {
    labels: string[];
    datasets: WeeklyDataset[];
  };
}

interface ComparisonResponse {
  status: string;
  message: string;
  data: {
    labels: string[];
    datasets: WeeklyDataset[];
  };
}

const WeeklySalesChart = () => {
  const [chartData, setChartData] = useState<ChartData<"bar" | "line", number[], string> | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const storeId = 1;
        const predResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/stock-ml/api/${storeId}/predictions/weekly`,
          { cache: "no-store" }
        );
        const predJson = (await predResponse.json()) as WeeklyPredictionResponse;

        const compResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/stock-ml/api/${storeId}/stock/comparison`,
          { cache: "no-store" }
        );
        const compJson = (await compResponse.json()) as ComparisonResponse;

        const labels = predJson.data.labels;
        const predDataset = predJson.data.datasets.find((ds) => ds.name === "예측 판매량");
        const upperDataset = predJson.data.datasets.find((ds) => ds.name === "신뢰구간 상한");
        const lowerDataset = predJson.data.datasets.find((ds) => ds.name === "신뢰구간 하한");
        const compDataset = compJson.data.datasets.find((ds) => ds.name === "전년도 판매량");

        const data: ChartData<"bar" | "line", number[], string> = {
          labels,
          datasets: [
            {
              label: "실제 판매량",
              data: compDataset ? compDataset.data : [],
              type: "bar",
              backgroundColor: "rgba(54, 162, 235, 0.5)",
            },
            {
              label: "예측 판매량",
              data: predDataset ? predDataset.data : [],
              type: "line",
              borderColor: "rgba(255, 99, 132, 1)",
              backgroundColor: "rgba(255, 99, 132, 0.5)",
              fill: false,
              tension: 0.3,
            },
            {
              label: "신뢰구간 상한",
              data: upperDataset ? upperDataset.data : [],
              type: "line",
              borderColor: "rgba(75, 192, 192, 1)",
              backgroundColor: "rgba(75, 192, 192, 0.5)",
              borderDash: [5, 5],
              fill: false,
              tension: 0.3,
            },
            {
              label: "신뢰구간 하한",
              data: lowerDataset ? lowerDataset.data : [],
              type: "line",
              borderColor: "rgba(153, 102, 255, 1)",
              backgroundColor: "rgba(153, 102, 255, 0.5)",
              borderDash: [5, 5],
              fill: false,
              tension: 0.3,
            },
          ],
        };
        setChartData(data);
      } catch (error) {
        console.error("주간 판매 데이터 호출 오류:", error);
      }
    }
    fetchData();
  }, []);

  const options: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "주문수 대비 재고 사용량 및 예측량",
      },
      legend: { position: "bottom" as const },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div>
      {chartData ? (
        <Chart type="bar" data={chartData as ChartData<"bar", number[], string>} options={options} />
      ) : (
        <p>데이터를 불러오는 중...</p>
      )}
    </div>
  );
};

export default WeeklySalesChart;
