import { useState, useEffect, useCallback } from "react";
import { NoticeResponse } from "@/features/notifications/types/notifications";
import noticeApi from "./noticeApi";

interface UseNoticeListProps {
  storeId: number;
  ownerName: string;
  pageSize?: number;
}

const useNoticeList = ({
  storeId,
  ownerName,
  pageSize = 7,
}: UseNoticeListProps) => {
  const [notices, setNotices] = useState<NoticeResponse | null>(null);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotices = useCallback(
    async (currentPage: number) => {
      try {
        setIsLoading(true);
        setError(null);

        const now = new Date();
        const params = {
          page: currentPage,
          pageSize,
          sortBy: "createdAt",
          direction: "DESC" as const,
          startDate: "2020-01-01 00:00:00",
          endDate: `${now.toISOString().split("T")[0]} 23:59:59`,
        };

        const response = await noticeApi.getNotices(storeId, params);

        if (!response.success) {
          if (response.code === "C-006") {
            setError("등록된 공지사항이 없습니다.");
            setNotices(null);
            return;
          }
          throw new Error(
            response.message || "공지사항을 불러오는데 실패했습니다."
          );
        }

        if (
          currentPage > response.data.totalPages - 1 &&
          response.data.totalPages > 0
        ) {
          setPage(response.data.totalPages - 1);
          fetchNotices(response.data.totalPages - 1);
          return;
        }

        setNotices(response.data);
      } catch (error) {
        setError("공지사항을 불러오는데 실패했습니다.");
        setNotices(null);
        if (process.env.NODE_ENV === "development") {
          console.error("공지사항 로딩 실패:", error);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [storeId, ownerName, pageSize]
  );

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  useEffect(() => {
    fetchNotices(page);
  }, [page, fetchNotices]);

  const refreshNotices = useCallback(() => {
    fetchNotices(page);
  }, [fetchNotices, page]);

  return {
    notices,
    isLoading,
    error,
    handlePageChange,
    refreshNotices,
    currentPage: page,
  };
};

export default useNoticeList;
