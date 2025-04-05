import { useEffect, useState } from "react";
import { Message } from "@/features/chat/types/chat";

interface RecentMessageState {
  recentMessage: Message | null;
  loading: boolean;
  error: string | null;
}

const useRecentMessage = (storeId: number): RecentMessageState => {
  const [recentMessage, setRecentMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentMessage = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/chat/select/recent/${storeId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch recent message");
        }
        const data = await response.json();
        // 백엔드 응답 형식: ApiResponse { data: ChatMessageResponse }
        setRecentMessage(data.data as Message);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentMessage();
  }, [storeId]);

  return { recentMessage, loading, error };
};

export default useRecentMessage;
