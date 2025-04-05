"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import FeedbackList from '@/features/dashboard/customer/components/FeedbackList';
import MLAnalysis from '@/features/dashboard/customer/components/MLAnalysis';

const CustomerDashboardPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true); // ✅ 로딩 상태 추가
  const router = useRouter();

  useEffect(() => {
    if (typeof document !== "undefined") {
      const cookieValue = document.cookie
        .split("; ")
        .find((cookie) => cookie.startsWith("selectStoreId="))
        ?.split("=")[1];

      const parsedStoreId = cookieValue ? parseInt(cookieValue, 10) : null;

      console.log("parsedStoreId: ", parsedStoreId);

      if (!parsedStoreId || isNaN(parsedStoreId)) {
        router.replace("/owner");
      } else {
        setStoreId(parsedStoreId);
      }
      setLoading(false); // ✅ storeId가 설정된 후 로딩 종료
    }
  }, [router]);

  // ✅ storeId가 설정되기 전에 화면에 아무것도 표시하지 않음
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 text-lg">로딩 중...</p>
      </div>
    );
  }

  return (
    <div style={{ height: 'calc(100vh - 64px)' }} className="flex flex-col md:flex-row">
      {/* 왼쪽 컬럼: 고객 피드백 */}
      <div className="md:w-1/2 p-4 md:p-6 border-r flex flex-col">
        <h2 className="text-2xl font-bold mb-4">고객 피드백</h2>
        {/* 카테고리 필터 버튼 */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`${buttonClass(selectedCategory === null)} rounded-xl`}
          >
            전체
          </button>
          <button
            onClick={() => setSelectedCategory('SERVICE')}
            className={`${buttonClass(selectedCategory === 'SERVICE')} rounded-xl`}
            
          >
            서비스
          </button>
          <button
            onClick={() => setSelectedCategory('LIVE')}
            className={`${buttonClass(selectedCategory === 'LIVE')} rounded-xl`}
          >
            실시간 서비스
          </button>
          <button
            onClick={() => setSelectedCategory('PRODUCT')}
            className={`${buttonClass(selectedCategory === 'PRODUCT')} rounded-xl`}
          >
            제품관련
          </button>
          <button
            onClick={() => setSelectedCategory('ETC')}
            className={`${buttonClass(selectedCategory === 'ETC')} rounded-xl`}
          >
            기타
          </button>
        </div>
        {/* 스크롤 가능한 콘텐츠 영역 */}
        <div className="flex-grow overflow-y-auto no-scrollbar">
          {storeId !== null && <FeedbackList storeId={storeId} selectedCategory={selectedCategory} />}
        </div>
      </div>

      {/* 오른쪽 컬럼: 피드백 분석 */}
      <div className="md:w-1/2 p-4 md:p-6 flex flex-col">
        <div className="flex-grow overflow-y-auto no-scrollbar">
          {storeId !== null && <MLAnalysis storeId={storeId} />}
        </div>
      </div>
    </div>
  );
};

// 버튼 스타일 함수
const buttonClass = (active: boolean) =>
  `px-4 py-2 rounded border transition-colors ${
    active ? 'bg-[#F27B39] text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
  }`;

export default CustomerDashboardPage;
