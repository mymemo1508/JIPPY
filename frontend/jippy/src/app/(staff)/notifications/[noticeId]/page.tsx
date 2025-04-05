"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageTitle from "@/features/common/components/layout/title/PageTitle";
import {
  Notice,
  ApiResponse,
} from "@/features/notifications/types/notifications";

const getCookieValue = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

const NoticeDetailPage = ({
  params
}: {
  params: { noticeId: string }
}) => {
  const router = useRouter();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNoticeDetail = async () => {
    try {
      setIsLoading(true);

      const encodedStoreIdList = getCookieValue('storeIdList');
      const userId = getCookieValue('userId');

      if (!encodedStoreIdList || !userId) {
        router.push("/login");
        return;
      }

      const decodedStoreIdList = decodeURIComponent(encodedStoreIdList);
      const storeIdList = JSON.parse(decodedStoreIdList);
      const storeId = storeIdList[0];

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notice/${storeId}/select/${params.noticeId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const responseData: ApiResponse<Notice> = await response.json();

      if (!responseData.success) {
        throw new Error(
          responseData.message || "공지사항을 불러오는데 실패했습니다"
        );
      }

      setNotice(responseData.data);
    } catch (error) {
      console.error("공지사항 상세 로딩에 실패했습니다", error);
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNoticeDetail();
  }, [params.noticeId]);

  const handleGoBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div>
        <PageTitle />
        <div className="p-4 text-center">로딩 중...</div>
      </div>
    );
  }

  if (!notice) {
    return (
      <div>
        <PageTitle />
        <div className="p-4 text-center">존재하지 않는 공지사항입니다</div>
        <div className="mt-4 text-center">
          <button
            onClick={handleGoBack}
            className="px-4 py-2 border border-[#ff5c00] text-[#ff5c00] rounded hover:bg-[#ff5c00] hover:text-white transition-colors"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageTitle />
      <div className="p-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="border-b pb-4">
            <h1 className="text-xl font-medium mb-2 break-words">{notice.title}</h1>
            <div className="flex justify-between text-sm text-gray-600">
              <span>{notice.author}</span>
              <span className="text-gray-300">{notice.createdAt}</span>
            </div>
          </div>

          <div className="py-6 whitespace-pre-wrap" style={{ wordBreak: 'keep-all' }}>{notice.content}</div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={handleGoBack}
              className="px-4 py-2 border border-[#ff5c00] text-[#ff5c00] rounded hover:bg-[#ff5c00] hover:text-white transition-colors"
            >
              목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticeDetailPage;