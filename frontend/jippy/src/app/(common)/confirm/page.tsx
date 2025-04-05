"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { logout } from "@/redux/slices/userSlice";
import "@/app/globals.css";
import { Button } from "@/features/common/components/ui/button";
import { ChevronDown } from "lucide-react";

const ConfirmPage = () => {
  const dispatch = useDispatch();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const accessToken = useSelector((state: RootState) => state.user.accessToken);
  const isAuthenticated = useSelector(
    (state: RootState) => state.user.isAuthenticated
  );
  const [isPosOpen, setPosOpen] = useState(false);
  const [isCommonOpen, setCommonOpen] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      if (!accessToken) {
        dispatch(logout());
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/logout`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "로그아웃 처리 중 오류가 발생했습니다."
        );
      }

      dispatch(logout());
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
      dispatch(logout());
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center gap-8">
      <div className="flex flex-col items-center gap-4 z-10 w-[200px]">
        {!isAuthenticated && (
          <Button variant="orange">
            <Link href="/signup/owner" className="w-full block">
              계정 생성
            </Link>
          </Button>
        )}

        {isAuthenticated ? (
          <Button
            variant="orange"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
          </Button>
        ) : (
          <Button variant="orangeBorder">
            <Link href="/login" className="w-full block">
              로그인
            </Link>
          </Button>
        )}

        {isAuthenticated && (
          <>
            <Button variant="default">
              <Link href="/update" className="w-full block">
                회원 정보 수정
              </Link>
            </Button>

            <Button variant="brown">
              <Link href="/shop/create" className="w-full block">
                매장 등록
              </Link>
            </Button>

            <Button variant="orangeSquare">
              <Link href="/shop" className="w-full block">
                매장 조회
              </Link>
            </Button>

            <Button variant="brown">
              <Link href="/order" className="w-full block">
                POS 주문
              </Link>
            </Button>

            <Button variant="orangeSquare">
              <Link href="/chat" className="w-full block">
                채팅
              </Link>
            </Button>
          </>
        )}

        <Button variant="primary">
          <Link href="/qr" className="w-full block">
            QR 페이지
          </Link>
        </Button>

        <Button
          variant="brown"
          onClick={() => setPosOpen(!isPosOpen)}
          className="flex items-center justify-between w-[256px]"
        >
          POS 관련
          <ChevronDown
            className={`ml-2 transition-transform duration-200 ${
              isPosOpen ? "rotate-180" : ""
            }`}
          />
        </Button>

        {isPosOpen && (
          <div className="w-full origin-top rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              <Link
                href="/order"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setPosOpen(false)}
              >
                주문 페이지
              </Link>
              <Link
                href="/product"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setPosOpen(false)}
              >
                상품 등록 페이지
              </Link>
            </div>
          </div>
        )}

        <Button
          variant="danger"
          onClick={() => setCommonOpen(!isCommonOpen)}
          className="flex items-center justify-between w-[256px]"
        >
          공통 요소
          <ChevronDown
            className={`ml-2 transition-transform duration-200 ${
              isCommonOpen ? "rotate-180" : ""
            }`}
          />
        </Button>

        {isCommonOpen && (
          <div className="w-full origin-top rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              <Link
                href="/error"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setCommonOpen(false)}
              >
                Error 페이지
              </Link>
              <Link
                href="/success"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setCommonOpen(false)}
              >
                Success 페이지
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmPage;
