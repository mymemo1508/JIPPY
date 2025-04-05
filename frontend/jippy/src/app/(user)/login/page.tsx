"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDispatch } from "react-redux";
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from "@/redux/slices/userSlice";
import { setShops, setCurrentShop } from "@/redux/slices/shopSlice"; // 여기 주목
import { AppDispatch } from "@/redux/store";
import "@/app/globals.css";
import styles from "@/app/page.module.css";
import Button from "@/features/common/components/ui/button/Button";

interface Shop {
  id: number;
  userOwnerId: number;
  name: string;
  address: string;
}

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("OWNER");
  const [isPos, setIsPos] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const setLoginTypeCookie = (type: string) => {
    document.cookie = `loginType=${type}; path=/; max-age=2419200`;
  };

  const handleRouting = () => {
    if (isPos) {
      router.replace("/shop");
    } else if (userType === "OWNER") {
      router.replace("/owner");
    } else if (userType === "STAFF") {
      router.replace("/attendance");
    }
  };

  const handleLogin = async () => {
    dispatch(loginStart());
    try {
      let adjustUserType: string = userType;
      if (userType === "POS") {
        adjustUserType = "OWNER";
      }
      console.log(userType); // 삭제 필요
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password, userType: adjustUserType }),
          credentials: "include",
        }
      );
      console.log("로그인 응답 상태:", response.status);
      console.log("로그인 응답:", response);

      // 응답 데이터 확인을 위한 로그 추가
      const responseData = await response.json();
      console.log("응답 데이터:", responseData);

      // 응답 구조 확인
      console.log("success 존재 여부:", "success" in responseData);
      console.log("data 존재 여부:", "data" in responseData);

      if (responseData.success && responseData.data.accessToken) {
        // 로그인 성공 후 쿠키 설정 확인
        console.log("설정된 쿠키:", document.cookie);

        setLoginTypeCookie(isPos ? "POS" : userType);

        dispatch(
          loginSuccess({
            profile: {
              id: responseData.data.id,
              email: responseData.data.email,
              name: responseData.data.name,
              age: responseData.data.age,
              userType: responseData.data.staffType,
            },
            accessToken: responseData.data.accessToken,
            refreshToken: responseData.data.refreshToken,
          })
        );

        if (userType === "STAFF") {
          router.replace("/attendance");
          return;
        }

        // 매장 정보 조회 및 리덕스 업데이트
        try {
          // 쿠키 디버깅을 위한 로그
          console.log("전체 쿠키:", document.cookie);

          const userId = document.cookie
            .split("; ")
            .map((cookie) => cookie.trim())
            .find((cookie) => cookie.startsWith("userId="))
            ?.split("=")[1];

          console.log("파싱된 userId:", userId);

          if (!userId) {
            console.log("userId 쿠키를 찾을 수 없음");
            throw new Error("사용자 정보를 찾을 수 없습니다.");
          }

          const shopsResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/store/select/list?ownerId=${userId}`,
            {
              headers: {
                Authorization: `Bearer ${responseData.data.accessToken}`,
                "Content-Type": "application/json",
              },
              credentials: "include",
            }
          );

          console.log("매장 조회 응답 상태:", shopsResponse.status);

          if (shopsResponse.ok) {
            const shopsData = await shopsResponse.json();
            console.log("매장 데이터:", shopsData);

            if (shopsData.success && shopsData.data.length > 0) {
              const userShops = shopsData.data
                .filter((shop: Shop) => {
                  console.log("매장 소유자 ID 비교:", {
                    shopOwnerId: shop.userOwnerId,
                    userId: parseInt(userId),
                  });
                  return shop.userOwnerId === parseInt(userId);
                })
                .map((shop: Shop) => ({
                  ...shop,
                  openingDate: "",
                  totalCash: 0,
                  businessRegistrationNumber: "",
                }));

              console.log("필터링된 사용자 매장:", userShops);

              if (userShops.length > 0) {
                dispatch(setShops(userShops));
                dispatch(setCurrentShop(userShops[0]));
                handleRouting();
              } else {
                console.log("필터링 후 매장이 없음");
                router.replace("/shop/create");
              }
            } else {
              console.log("매장 데이터가 없음:", shopsData);
              router.replace("/shop/create");
            }
          } else {
            const errorData = await shopsResponse.json().catch(() => ({}));
            console.error("매장 조회 실패 응답:", errorData);
            throw new Error(
              errorData.message || "매장 정보를 불러오는 데 실패했습니다."
            );
          }
        } catch (error) {
          console.error("매장 정보 조회 중 상세 오류:", error);
          dispatch(
            loginFailure(
              error instanceof Error
                ? error.message
                : "매장 정보 조회 중 오류가 발생했습니다."
            )
          );
        }
      } else {
        throw new Error("로그인 응답이 올바르지 않습니다");
      }
    } catch (error) {
      dispatch(
        loginFailure(
          error instanceof Error
            ? error.message
            : "로그인 중 오류가 발생했습니다"
        )
      );
      console.error("로그인 에러:", error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    handleLogin();
    e.preventDefault();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center justify-center min-h-screen"
    >
      <h1 className={styles.subtitle}>로그인</h1>

      <div className="flex gap-4 m-2">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            value="OWNER"
            checked={userType === "OWNER"}
            onChange={(e) => {
              setUserType(e.target.value);
              setIsPos(false);
            }}
            className="form-radio appearance-none relative h-5 w-5 border border-gray-300 rounded-full 
             before:absolute before:inset-0 before:w-full before:h-full before:rounded-full before:border before:border-gray-300 
             checked:before:border-[#F27B39] checked:after:absolute checked:after:inset-[4px] checked:after:bg-[#F27B39] 
             checked:after:rounded-full"
          />
          <span>점주</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            value="STAFF"
            checked={userType === "STAFF"}
            onChange={(e) => {
              setUserType(e.target.value);
              setIsPos(false);
            }}
            className="form-radio appearance-none relative h-5 w-5 border border-gray-300 rounded-full 
             before:absolute before:inset-0 before:w-full before:h-full before:rounded-full before:border before:border-gray-300 
             checked:before:border-[#F27B39] checked:after:absolute checked:after:inset-[4px] checked:after:bg-[#F27B39] 
             checked:after:rounded-full"
          />
          <span>직원</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            value="POS"
            checked={userType === "POS"}
            onChange={(e) => {
              setUserType(e.target.value);
              setIsPos(true);
            }}
            className="form-radio appearance-none relative h-5 w-5 border border-gray-300 rounded-full 
             before:absolute before:inset-0 before:w-full before:h-full before:rounded-full before:border before:border-gray-300 
             checked:before:border-[#F27B39] checked:after:absolute checked:after:inset-[4px] checked:after:bg-[#F27B39] 
             checked:after:rounded-full"
          />
          <span>POS</span>
        </label>
      </div>

      <input
        type="email"
        placeholder="이메일 입력"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 m-2 w-64 rounded"
      />
      <input
        type="password"
        placeholder="비밀번호 입력"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 m-2 w-64 rounded"
      />

      <Button variant="orange">로그인</Button>

      <div className="w-64 h-px bg-gray-300 my-6"></div>

      <div className="text-sm">
        <span className="text-gray-600">비밀번호가 기억 안 나요! </span>
        <Link href="/reset" className="text-orange-500 hover:text-orange-600">
          비밀번호 재발급
        </Link>
      </div>
    </form>
  );
};

export default LoginPage;
