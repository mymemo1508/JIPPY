import { useEffect, useState } from "react";

const useChatMemberCount = (storeId: number): { memberCount: number | null; loading: boolean; error: string | null } => {
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    const fetchMemberCount = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/chat/count/${storeId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch chat member count");
        }
        const data = await response.json();
        // 백엔드 응답 형식: ApiResponse { data: number }
        setMemberCount(data.data as number);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberCount();
  }, [storeId]);

  return { memberCount, loading, error };
};

export default useChatMemberCount;
