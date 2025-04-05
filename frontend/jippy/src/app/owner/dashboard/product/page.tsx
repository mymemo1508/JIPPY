"use client";

export const dynamic = "force-dynamic";

import ProductTable from "./ProductTable";
import ProductChart from "./ProductChart";
import CategoryPieChart from "./CategoryPieChart";
import SeasonPreferenceChart from "./SeasonPreferenceChart";
import { StoreProvider } from "@/redux/StoreProvider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// ✅ 쿠키에서 특정 키의 값을 가져오는 유틸 함수
const getCookie = (key: string): string | null => {
  if (typeof document === "undefined") return null;
  return (
    document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith(`${key}=`))
      ?.split("=")[1] || null
  );
};

// ✅ 비동기 API 호출 함수
const getProductData = async (storeId: number, accessToken: string) => {
  console.log(`Fetching product data for storeId: ${storeId}`); // ✅ 디버깅용 로그 추가

  try {
    const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/product/${storeId}/select`;

    const res = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!res.ok) throw new Error("데이터를 불러오는데 실패했습니다.");
    const json = await res.json();
    console.log("Fetched Data:", json?.data); // ✅ 응답 데이터 확인 로그 추가

    return json?.data || [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export default function ProductDashboardPage() {
  const [storeId, setStoreId] = useState<number | null>(null);
  const [productData, setProductData] = useState([]);
  const router = useRouter();

  // ✅ 스토어 ID 가져오기
  useEffect(() => {
    const cookieStoreId = getCookie("selectStoreId");
    const parsedStoreId = cookieStoreId ? parseInt(cookieStoreId, 10) : null;

    console.log("Parsed storeId:", parsedStoreId); // ✅ 디버깅용 로그 추가

    if (!parsedStoreId || isNaN(parsedStoreId)) {
      router.replace("/owner");
    } else {
      setStoreId(parsedStoreId);
    }
  }, [router]);

  // ✅ 데이터 가져오기
  useEffect(() => {
    if (storeId === null) return; // ✅ storeId가 설정되기 전에 실행되지 않도록 방어 코드 추가

    const accessToken = getCookie("accessToken");
    if (!accessToken) {
      router.replace("/login");
      return;
    }

    (async () => {
      console.log("Fetching product data..."); // ✅ 디버깅용 로그 추가
      const data = await getProductData(storeId, accessToken);
      setProductData(data);
    })();
  }, [storeId, router]); // ✅ storeId가 변경될 때마다 실행되도록 수정

  return (
    <StoreProvider preloadedState={productData}>
      <div className="max-w mx-auto p-4 pb-20 h-screen overflow-y-auto no-scrollbar">
        {/* 상품 테이블 카드 */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-4 border border-gray-200">
          <ProductTable productData={productData}/>
        </div>

        {/* 2열 그리드: ProductChart와 CategoryPieChart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            {storeId && <ProductChart storeId={storeId} />}
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            {storeId && <CategoryPieChart storeId={storeId} />}
          </div>
        </div>

        {/* SeasonPreferenceChart 카드 */}
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          {storeId && <SeasonPreferenceChart storeId={storeId} />}
        </div>
      </div>
    </StoreProvider>
  );
}
