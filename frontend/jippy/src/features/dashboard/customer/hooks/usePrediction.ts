import { useState, useEffect } from 'react';
import { PredictionData } from '@/features/dashboard/customer/types/customer';
import { useRouter } from "next/navigation";

const usePrediction = (storeId: number) => {
  const [data, setData] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    const fetchPrediction = async () => {
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
        const endpoint = `https://jippy.duckdns.org/feedback-ml/predictions/${storeId}`
        const res = await fetch(endpoint, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`, // ✅ accessToken 추가
            "Content-Type": "application/json",
          },
          credentials: "include", // ✅ 인증 정보 포함
          cache: "no-store",
        });
        if (!res.ok) throw new Error('분석 데이터 조회에 실패했습니다.');
        const json = await res.json();
        setData(json);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message || '알 수 없는 에러');
        } else {
          setError('알 수 없는 에러');
        }
      }
      setLoading(false);
    };

    fetchPrediction();
  }, [storeId]);

  return { data, loading, error, refetch: () => {} };
};

export default usePrediction;
