import StockTable from "./StockTable";
import StockBarChart from "./StockBarChart";
import WeeklyPredictionChart from "@/features/dashboard/stock/components/WeeklyPredictionChart";
import StockComparisonChart from "@/features/dashboard/stock/components/StockComparisonChart";
import { StoreProvider } from "@/redux/StoreProvider";
import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LowStockStatus from "@/features/dashboard/stock/components/LowStockStatus";

const getStockData = async (storeId: number, accessToken: string) => {
  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/stock/${storeId}/select`;

  try {
    const response = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) throw new Error("데이터를 불러오는데 실패했습니다.");

    const data = await response.json();
    return data?.data?.inventory || [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

const getStockStatusData = async (storeId: number, accessToken: string) => {
  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/stock-status/${storeId}/select`;

  try {
    const response = await fetch(API_URL, {
      headers : {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) throw new Error("재고 현황을 불러오는데 실패 했습니다");

    const data = await response.json();
    return data?.data || null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default async function StockPage() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const storeId = cookieStore.get("selectStoreId")?.value;

  if (!accessToken) {
    redirect("/login");
  }
  const parsedStoreId = storeId ? parseInt(storeId, 10) : null;
  if (!parsedStoreId || isNaN(parsedStoreId)) {
    redirect("/owner");
  }

  const [stockData, stockStatusData] = await Promise.all([
    getStockData(parsedStoreId, accessToken),
    getStockStatusData(parsedStoreId, accessToken)
  ]);

  return (
    <StoreProvider preloadedState={stockData}>
      <div className="min-h-screen">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <StockTable />
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4 mt-4 flex gap-4">
          <div className="w-1/2">
            <h2 className="text-xl font-bold mb-2">주간 재고 판매 예측</h2>
            <WeeklyPredictionChart />
          </div>
          <div className="w-1/2">
            <h2 className="text-xl font-bold mb-2">재고 현황</h2>
            <LowStockStatus data={stockStatusData} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 mt-4 flex gap-4">
          <div className="w-1/2">
            <h2 className="text-xl font-bold mb-2">재고 데이터</h2>
            <StockBarChart />
          </div>
          <div className="w-1/2">
            <h2 className="text-xl font-bold mb-2">최근 30일 재고 그래프</h2>
            <StockComparisonChart />
          </div>
        </div>
      </div>
    </StoreProvider>
  );
}