"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Navbar from "@/features/owner/navbar/MainNavbar";

// ✅ Shop 타입 정의
interface Shop {
  id: number;
  name: string;
  address: string;
  userOwnerId: number;
  openingDate?: string;
  totalCash?: number;
  businessRegistrationNumber?: string;
}

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]); // ✅ `Shop[]`으로 타입 지정
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [localError, setLocalError] = useState<string | null>(null);
  const [triggerFetch, setTriggerFetch] = useState<boolean>(false);

  const router = useRouter();
  const pathname = usePathname(); // ✅ 현재 경로 가져오기

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null); // ✅ userId는 숫자로 처리

  useEffect(() => {
    if (typeof document !== "undefined") {
      const token =
        document.cookie
          .split("; ")
          .find((cookie) => cookie.startsWith("accessToken="))
          ?.split("=")[1] || null;
      const userIdString =
        document.cookie
          .split("; ")
          .find((cookie) => cookie.startsWith("userId="))
          ?.split("=")[1] || null;

      setAccessToken(token);
      setUserId(userIdString ? Number(userIdString) : null); // ✅ userId를 숫자로 변환
    }
  }, []);

  useEffect(() => {
    const fetchShops = async () => {
      if (!userId || !accessToken) return;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/store/select/list?ownerId=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        console.log("매장 조회 응답 상태:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("매장 데이터:", data);

          if (data.success && Array.isArray(data.data)) {
            const userShops: Shop[] = data.data
              .filter((shop: Shop) => shop.userOwnerId === userId)
              .map((shop: Shop) => ({
                ...shop,
                openingDate: shop.openingDate ?? "",
                totalCash: shop.totalCash ?? 0,
                businessRegistrationNumber:
                  shop.businessRegistrationNumber ?? "",
              }));

            setShops(userShops);
          }
        } else {
          throw new Error("매장 목록을 불러오지 못했습니다.");
        }
      } catch (err) {
        console.error("Error fetching shops:", err);
        setLocalError(
          "매장 정보를 불러오는데 실패했습니다. 다시 시도해주세요."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchShops();
  }, [userId, accessToken, triggerFetch, pathname]); // ✅ pathname 사용하여 URL 변경 감지

  const fetchShopDetail = async (storeId: number) => {
    try {
      document.cookie = `selectStoreId=${storeId}; path=/; max-age=2419200`;

      if (!accessToken) {
        setLocalError("로그인이 필요합니다.");
        return;
      }

      const selectedShop = shops.find((shop) => shop.id === storeId);
      if (selectedShop) {
        router.replace("/owner/dashboard/sale");
        setTimeout(() => setTriggerFetch((prev) => !prev), 100); // ✅ 상태 변경으로 리렌더링 유도
      } else {
        throw new Error("매장을 찾을 수 없습니다.");
      }
    } catch (err) {
      setLocalError("매장 정보를 불러오는데 실패했습니다.");
      console.error("Error fetching shop detail:", err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Navbar />  
      <h1 className="text-2xl font-bold mb-6">내 매장 목록</h1>
      {localError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {localError}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : shops.length === 0 ? (
        <div className="text-center text-gray-600">등록된 매장이 없습니다.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {shops.map((shop) => (
    <div
      key={shop.id}
      onClick={() => fetchShopDetail(shop.id)}
      className="cursor-pointer block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
    >
      <h2 className="text-xl font-semibold mb-2">{shop.name}</h2>
      <p className="text-gray-600">{shop.address}</p>
    </div>
  ))}

  {/* ✅ 매장 추가 버튼 */}
  <div
    onClick={() => router.push("/shop/create")}
    className="cursor-pointer flex flex-col justify-center items-center p-6 bg-gray-100 rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-dashed border-gray-400"
  >
    <span className="text-4xl">+</span>
    <p className="text-gray-600 mt-2">매장 추가</p>
  </div>
</div>

      )}
    </div>
  );
}
