import { useState, useEffect } from 'react';
import { Feedback } from '@/features/dashboard/customer/types/customer';
import { useRouter } from "next/navigation";

const useFeedbacks = (storeId: number, category: string | null) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();


  useEffect(() => {
    const fetchFeedbacks = async () => {
      setLoading(true);
      setError(null);
      try {
          const accessToken =
            document.cookie
              .split("; ")
              .find((cookie) => cookie.startsWith("accessToken="))
              ?.split("=")[1] || null;
        if (accessToken === null) {
          router.replace("/login");
        }
        const endpoint = category
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/feedback/${storeId}/select/${category}`
          : `${process.env.NEXT_PUBLIC_API_URL}/api/feedback/${storeId}/select`;
        const res = await fetch(endpoint, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`, // ✅ accessToken 추가
            "Content-Type": "application/json",
          },
          credentials: "include", // ✅ 인증 정보 포함
          cache: "no-store",
        });
        if (!res.ok) throw new Error('피드백 조회에 실패했습니다.');
        const json = await res.json();
        // 백엔드 ApiResponse 형식: { data: Feedback[] }
        setFeedbacks(json.data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message || '알 수 없는 에러');
        } else {
          setError('알 수 없는 에러');
        }
      }
      setLoading(false);
    };

    fetchFeedbacks();
  }, [storeId, category]);

  const deleteFeedback = async (feedbackId: number) => {
    const confirmed = window.confirm('리뷰를 삭제하시겠습니까?');
    if (!confirmed) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback/${storeId}/delete/${feedbackId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('삭제에 실패했습니다.');
      // 삭제 후 상태를 갱신(예: 필터링)
      setFeedbacks(prev => prev.filter(fb => fb.id !== feedbackId));
    } catch (err) {
      console.error(err);
    }
  };

  return { feedbacks, loading, error, deleteFeedback, refetch: () => {} };
};

export default useFeedbacks;
