"use client";

import React, { useState, useEffect, ReactNode } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

async function fetchSalesByMonth(
  storeId: string | null,
  startDate: string,
  endDate: string,
  accessToken: string | null
) {
  if (!accessToken) return []; // accessToken이 없으면 요청을 보내지 않음

  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/payment-history/sales/month?storeId=${storeId}&startDate=${startDate}&endDate=${endDate}`;
  console.log(API_URL);

  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`, // ✅ accessToken 추가
        "Content-Type": "application/json",
      },
      credentials: "include", // ✅ 인증 정보 포함
      cache: "no-store",
    });

    if (!response.ok) throw new Error("데이터를 불러오는데 실패했습니다.");
    const data = await response.json();
    console.log(data);
    return data || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function fetchProductSalesInfo(
  storeId: string | null,
  startDate: string,
  endDate: string,
  accessToken: string | null
) {
  if (!accessToken) return [];

  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/product/${storeId}/fetch/all?startDate=${startDate}&endDate=${endDate}`;
  console.log(API_URL);

  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`, // ✅ accessToken 추가
        "Content-Type": "application/json",
      },
      credentials: "include", // ✅ 인증 정보 포함
      cache: "no-store",
    });

    if (!response.ok) throw new Error("데이터를 불러오는데 실패했습니다.");
    const data = await response.json();
    console.log(data);
    return data || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

interface SalesMonthData {
  date: string; // "2025-01" 형태의 문자열
  totalSales: number; // 매출
  orderCount: number; // 주문 수
}

interface ProductSalesInfo {
  productId: number;
  productCategoryId: number;
  storeId: number;
  name: string; // 제품명
  price: number; // 가격
  status: boolean; // 상태
  totalSold: number; // 판매된 수량
  image: string; // 이미지 링크
  productType: string; // 예: "ICE"
  productSize: string; // 예: "M"
}

const Card = ({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) => (
  <div
    className={`border rounded-lg p-4 shadow-md bg-white h-full ${
      className || ""
    }`}
  >
    {children}
  </div>
);

const CardContent = ({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) => <div className={`p-2 ${className || ""}`}>{children}</div>;

const Dashboard = () => {
  const startMonthDate = "2024-01";
  const endMonthDate = "2024-12";
  const startMonthNowDate = "2025-01";
  const endMonthNowDate = "2025-12";

  // 클라이언트 사이드에서만 실행하도록 변경
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof document !== "undefined") {
      // document가 클라이언트에서만 실행됨을 보장
      const token =
        document.cookie
          .split("; ")
          .find((cookie) => cookie.startsWith("accessToken="))
          ?.split("=")[1] || null;
      const storeId =
        document.cookie
          .split("; ")
          .find((cookie) => cookie.startsWith("selectStoreId="))
          ?.split("=")[1] || null;

      setAccessToken(token);
      setStoreId(storeId);
    }
  }, []); // 👈 useEffect 안에서 실행 (클라이언트 사이드에서만 실행됨)

  const [salesMonthData, setSalesMonthData] = useState<SalesMonthData[]>([]);
  const [productSalesInfo, setProductSalesInfo] = useState<ProductSalesInfo[]>(
    []
  );

  const [productSalesNowInfo, setProductSalesNowInfo] = useState<
    ProductSalesInfo[]
  >([]);
  const [salesMonthNowData, setSalesMonthNowData] = useState<SalesMonthData[]>(
    []
  );
  const [topN, setTopN] = useState<number>(10);

  const monthNames = [
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

  const currentMonth = new Date().getMonth(); // 현재 월 (0~11)
  // 데이터를 12개월 기준으로 정리하는 함수
  const fillMissingMonths = (data: SalesMonthData[]) => {
    const monthMap = new Map(
      data.map((sale) => [sale.date.split("-")[1], sale.totalSales])
    );
    return monthNames.map(
      (_, index) => monthMap.get(String(index + 1).padStart(2, "0")) ?? 0
    );
  };

  const fillMissingBarMonths = (
    data: SalesMonthData[],
    key: "totalSales" | "orderCount"
  ) => {
    const monthMap = new Map(
      data.map((sale) => [sale.date.split("-")[1], sale[key] ?? 0])
    );

    return monthNames.map(
      (_, index) => monthMap.get(String(index + 1).padStart(2, "0")) ?? 0
    );
  };

  useEffect(() => {
    if (!accessToken) return; // ✅ accessToken이 없으면 실행하지 않음

    const getSalesMonthData = async () => {
      const data = await fetchSalesByMonth(
        storeId,
        startMonthDate,
        endMonthDate,
        accessToken
      );
      setSalesMonthData(data?.data?.salesByMonth || []);
    };

    const getProductSalesInfo = async () => {
      const data = await fetchProductSalesInfo(
        storeId,
        startMonthNowDate,
        endMonthNowDate,
        accessToken
      );
      setProductSalesInfo(data?.data?.productSoldInfo || []);
    };

    const getProductSalesNowInfo = async () => {
      const data = await fetchProductSalesInfo(
        storeId,
        startMonthNowDate,
        endMonthNowDate,
        accessToken
      );
      setProductSalesNowInfo(data?.data?.productSoldInfo || []);
    };

    const getSalesMonthNowData = async () => {
      const data = await fetchSalesByMonth(
        storeId,
        startMonthNowDate,
        endMonthNowDate,
        accessToken
      );
      console.log(data);
      setSalesMonthNowData(data?.data?.salesByMonth || []);
    };

    getSalesMonthData();
    getSalesMonthNowData();
    getProductSalesInfo();
    getProductSalesNowInfo();
  }, [storeId, accessToken]); // ✅ accessToken을 의존성 배열에 추가

  return (
    <div className="grid grid-cols-2 gap-4 p-4 h-screen">
      <div className="col-span-2 grid grid-cols-4 gap-4">
        <Card className="bg-[#FF5C00] text-[#FFCCB0]">
          <CardContent>
            <h3 className="text-lg font-bold text-black">
              2025년 기준 총 매출
            </h3>
            <p className="text-2xl font-semibold text-[#FF5C00]">
              {salesMonthNowData
                .reduce((sum, sale) => sum + sale.totalSales, 0)
                .toLocaleString()}{" "}
              원
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#FF5C00] text-[#FFCCB0]">
          <CardContent>
            <h3 className="text-lg font-bold text-black">
              2025년 기준 총 판매수
            </h3>
            <p className="text-2xl font-semibold text-[#FF5C00]">
              {productSalesNowInfo
                .reduce((sum, product) => sum + product.totalSold, 0)
                .toLocaleString()}{" "}
              개
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#FF5C00] text-[#FFCCB0]">
          <CardContent>
            <h3 className="text-lg font-bold text-black">
              2024년 총 판매된 오더 개수
            </h3>
            <p className="text-2xl font-semibold text-[#FF5C00]">
              {productSalesInfo
                .reduce((sum, product) => sum + product.totalSold, 0)
                .toLocaleString()}{" "}
              개
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#FF5C00] text-[#FFCCB0]">
          <CardContent>
            <h3 className="text-lg font-bold text-black">2025년 총 인건비</h3>
            <p className="text-2xl font-semibold text-[#FF5C00]">
              1,200,000 원
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Data Table with Scroll */}
      <Card>
        <CardContent>
          <h3 className="text-3xl font-bold text-[#FF5C00]">판매 데이터</h3>
          <br></br>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-[#FFCCB0] bg-opacity-50">
                  <th className="border p-2">Date</th>
                  <th className="border p-2">Sales</th>
                </tr>
              </thead>
              <tbody>
                {productSalesInfo.length > 0 ? (
                  productSalesInfo.map((sale, index) => (
                    <tr key={index} className="border">
                      <td className="border p-2">{sale.name}</td>
                      <td className="border p-2">
                        {(sale.totalSold * sale.price).toLocaleString()} 원
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="p-2 text-center">
                      데이터가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Sales vs Orders */}
      <Card>
        <CardContent>
          <h3 className="text-3xl font-bold text-[#FF5C00]">
            주문수 대비 매출
          </h3>
          <br></br>
          <Bar
            data={{
              labels: monthNames,
              datasets: [
                {
                  label: "매출",
                  data: fillMissingBarMonths(salesMonthNowData, "totalSales"),
                  backgroundColor: "#FF5C00",
                  yAxisID: "y1",
                },
                {
                  label: "주문수",
                  data: fillMissingBarMonths(salesMonthNowData, "orderCount"),
                  backgroundColor: "#FFCCB0",
                  yAxisID: "y2",
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "top",
                },
              },
              scales: {
                y1: {
                  type: "linear" as const,
                  position: "left",
                  beginAtZero: true, // ✅ TypeScript에서도 정상적으로 동작
                  title: {
                    display: true,
                    text: "매출 (원)",
                  },
                },
                y2: {
                  type: "linear" as const,
                  position: "right",
                  beginAtZero: true, // ✅ TypeScript에서도 정상적으로 동작
                  title: {
                    display: true,
                    text: "주문수 (건)",
                  },
                  grid: {
                    drawOnChartArea: false,
                  },
                },
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Yearly Comparison */}
      <Card>
        <CardContent>
          <h3 className="text-3xl font-bold text-[#FF5C00]">
            전년 대비 매출 비교
          </h3>
          <br></br>
          <Line
            data={{
              labels: monthNames,
              datasets: [
                {
                  label: "2025년",
                  data: fillMissingMonths(salesMonthNowData).map((value) =>
                    value === 0 ? null : value
                  ),
                  borderColor: "#FF5C00", // MainOrange
                  backgroundColor: "rgba(255,92,0,0.2)",
                  fill: true,
                  pointBackgroundColor: monthNames.map((_, i) =>
                    i === currentMonth ? "#FF5C00" : "#FF5C00"
                  ),
                  pointRadius: monthNames.map((_, i) =>
                    i === currentMonth ? 8 : 5
                  ),
                },
                {
                  label: "2024년",
                  data: fillMissingMonths(salesMonthData),
                  borderColor: "#FFCCB0", // DeepOrange
                  backgroundColor: "rgba(255,204,176,0.2)",
                  fill: true,
                  pointBackgroundColor: monthNames.map((_, i) =>
                    i === currentMonth ? "#FFCCB0" : "#FFCCB0"
                  ),
                  pointRadius: monthNames.map((_, i) =>
                    i === currentMonth ? 8 : 5
                  ),
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "top",
                },
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Sales by Product with Adjustable Size */}
      <Card>
        <CardContent>
          <h3 className="text-3xl font-bold text-[#FF5C00]">상품 판매 현황</h3>
          <br></br>
          <label htmlFor="topN">표시할 개수: </label>
          <input
            type="number"
            id="topN"
            value={topN}
            onChange={(e) =>
              setTopN(Math.max(1, parseInt(e.target.value) || 10))
            }
            className="border p-1 ml-2"
          />
          <div className="w-[500px] h-[500px] mx-auto">
            <Pie
              data={{
                labels: [...productSalesInfo]
                  .sort((a, b) => b.totalSold - a.totalSold) // 판매량 기준 정렬
                  .slice(0, topN)
                  .map(
                    (sale) =>
                      `${sale.name} (${sale.productType} - ${sale.productSize})`
                  ),
                datasets: [
                  {
                    label: "총 판매량",
                    data: [...productSalesInfo]
                      .sort((a, b) => b.totalSold - a.totalSold) // 판매량 기준 정렬
                      .slice(0, topN)
                      .map((sale) => sale.totalSold),
                    backgroundColor: [...productSalesInfo]
                      .sort((a, b) => b.totalSold - a.totalSold) // 판매량 기준 정렬
                      .slice(0, topN)
                      .map((sale, index, arr) => {
                        const intensity = 1 - (index / arr.length) * 0.6; // 색상의 진하기 조정
                        return `rgba(255, 92, 0, ${intensity})`; // MainOrange 기반 색상 조정
                      }),
                  },
                ],
              }}
              options={{ maintainAspectRatio: false }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
