"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AttendanceButtons from "@/features/attendance/components/AttendanceButtons";
import PageTitle from "@/features/common/components/layout/title/PageTitle";

const Home = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("사용자");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        const encodedStoreIdList = getCookieValue("storeIdList");
        const userId = getCookieValue("userId");
        const name = getCookieValue("userName");

        if (!encodedStoreIdList || !userId) {
          router.push("/login");
          return;
        }

        if (name) {
          setUserName(decodeURIComponent(name));
        }
      } catch (error) {
        console.error("사용자 정보 조회 중 오류:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const getCookieValue = (name: string): string | null => {
    if (typeof document === "undefined") return null;

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(";").shift() || null;
    }
    return null;
  };

  const handleLogout = async () => {
    try {
      const accessToken = getCookieValue("accessToken");

      if (!accessToken) {
        clearCookies();
        router.push("/login");
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/user/logout`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("로그아웃 실패");
        }
      } catch (error) {
        console.error("로그아웃 API 호출 중 오류:", error);
      }

      clearCookies();
      router.push("/login");
      alert("성공적으로 로그아웃되었습니다.");
    } catch (error) {
      console.error("로그아웃 중 예상치 못한 오류:", error);
      clearCookies();
      router.push("/login");
      alert("로그아웃 중 오류가 발생했습니다. 다시 로그인해주세요.");
    }
  };

  const clearCookies = () => {
    document.cookie =
      "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "userId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie =
      "userName=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "staffId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie =
      "storeIdList=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  };

  const storeIdListStr = getCookieValue("storeIdList");
  const storeId: number = storeIdListStr
    ? JSON.parse(decodeURIComponent(storeIdListStr))[0]
    : 1;
  const staffId = parseInt(getCookieValue("userId") ?? "1", 10);

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="h-full">
      <PageTitle />
      <div className="text-center mt-[139px]">
        <h1 className="text-[24px] font-bold text-black">
          안녕하세요, {userName}님!
          <br />
          오늘도 파이팅하세요🍀
        </h1>
      </div>

      <br />
      <AttendanceButtons storeId={storeId} staffId={staffId} />
      <div className="mt-auto pb-8 text-center">
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
};

export default Home;
