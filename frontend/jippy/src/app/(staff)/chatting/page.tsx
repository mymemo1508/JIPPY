"use client"

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ChatList from "@/features/pwachatting/components/ChatList";
import ChatRoom from "@/features/pwachatting/components/ChatRoom";
import { fetchChatList, setSelectedChatRoom } from "@/redux/slices/chatSlice";
import { StoreChat } from "@/features/pwachatting/types/chatting";
import { RootState, AppDispatch } from "@/redux/store";
import PageTitle from "@/features/common/components/layout/title/PageTitle";
import useUserInfo from "@/utils/useUserInfo";
import { ChevronLeft, User } from 'lucide-react';
import useChatMemberCount from "@/features/chat/hooks/useChatMemberCount";
import { useRouter } from "next/navigation";
import { usePwaFCM } from "@/features/pwachatting/hooks/pwaUseFCM";

const getCookieValue = (name: string): string | null => {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

const ChattingPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const chatRooms: StoreChat[] = useSelector((state: RootState) => state.chat.chatList);
  const selectedChatRoom: StoreChat | null = useSelector(
    (state: RootState) => state.chat.selectedChatRoom
  );

  const { memberCount, loading, error } = useChatMemberCount(
    selectedChatRoom?.storeId ?? 0
  );

  const userInfo = useUserInfo();
  const userId: number = userInfo.userId ?? 1;
  const userName: string = userInfo.userName ?? "";

  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showChatList, setShowChatList] = useState<boolean>(true);

  usePwaFCM();

  useEffect(() => {
    dispatch(fetchChatList(userId));
  }, [userId, dispatch]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsMobile(true);
        setShowChatList(true);
      } else {
        setIsMobile(false);
        setShowChatList(true);
      }
      const encodedStoreIdList = getCookieValue('storeIdList');
      const userId = getCookieValue('userId');

      if (!encodedStoreIdList || !userId) {
        router.push("/login");
        return;
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleChatRoomSelect = (room: StoreChat): void => {
    dispatch(setSelectedChatRoom(room));
    if (isMobile) {
      setShowChatList(false);
    }
  };

  const handleBackToList = () => {
    setShowChatList(true);
  };

  return (
    <div className="h-[calc(100vh-56px)]">
      {showChatList ? (
        <div className="h-full">
          <div className="sticky top-0 z-10">
            <PageTitle />
          </div>
          <ChatList chatRooms={chatRooms} onSelect={handleChatRoomSelect} />
        </div>
      ) : (
        <div className="h-full">
          <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
            <div className="flex items-center">
              <button
                onClick={handleBackToList}
                className="mr-3 hover:bg-orange-50 p-1 rounded-full text-orange-500"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>
            {selectedChatRoom && (
              <div className="flex items-center gap-1 text-sm text-orange-500">
                <User className="w-4 h-4" />
                {loading
                  ? "로딩 중..."
                  : error
                    ? "오류 발생"
                    : `${memberCount}`}
              </div>
            )}
          </div>
          {selectedChatRoom ? (
            <ChatRoom
              chatRoom={selectedChatRoom}
              userId={userId}
              userName={userName}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <h2>채팅방을 선택해 주세요.</h2>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChattingPage;