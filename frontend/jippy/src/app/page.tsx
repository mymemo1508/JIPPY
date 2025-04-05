"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { logout } from "@/redux/slices/userSlice";
import "@/app/globals.css";
import styles from "./page.module.css";
import { Button } from "@/features/common/components/ui/button";
import Image from "next/image";

const JippyPage = () => {
  const dispatch = useDispatch();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const accessToken = useSelector((state: RootState) => state.user.accessToken);
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      if (!accessToken) {
        dispatch(logout());
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/logout`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "로그아웃 처리 중 오류가 발생했습니다.");
      }

      dispatch(logout());
      
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
      // 에러가 발생하더라도 로컬 상태는 초기화
      dispatch(logout());
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center gap-8">
      <Image
        src="/images/MainDeco.svg"
        alt="Background decoration"
        fill
        className={styles.backgroundImage}
        priority
      />

      <h1 className={styles.title}>Jippy</h1>

      <h3 className={styles.subtitle}>
        소상공인을 위한<br/>카페 매장 관리 서비스
      </h3>
      
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
      </div>
    </div>
  );
};

export default JippyPage;