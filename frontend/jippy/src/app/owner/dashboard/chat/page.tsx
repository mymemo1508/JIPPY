"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ChatList from "@/features/chat/components/ChatList";
import ChatRoom from "@/features/chat/components/ChatRoom";
import useFCM from "@/features/chat/hooks/useFCM";
import { fetchChatList, setSelectedChatRoom } from "@/redux/slices/chatSlice";
import { StoreChat } from "@/features/chat/types/chat";
import { RootState, AppDispatch } from "@/redux/store";
import useUserInfo from "@/utils/useUserInfo";
import styles from "@/features/chat/styles/ChatPage.module.css";

const ChatPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const chatRooms: StoreChat[] = useSelector((state: RootState) => state.chat.chatList);
  const selectedChatRoom: StoreChat | null = useSelector(
    (state: RootState) => state.chat.selectedChatRoom
  );
  
  

  // useUserInfo를 통해 쿠키에서 사용자 정보를 읽어옵니다.
  const userInfo = useUserInfo();
  const userId: number = userInfo.userId ?? 1;
  const userName: string = userInfo.userName ?? "";
  const staffType = userInfo.staffType ?? "STAFF";

  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showChatList, setShowChatList] = useState<boolean>(true);

  const { initializeFCM } = useFCM(userId, staffType);

  useEffect(() => {
    dispatch(fetchChatList(userId));
    initializeFCM();
  }, [userId, dispatch, initializeFCM]);

  useEffect(() => {
    // 채팅방 선택 시, ChatRoom 내에서 WebSocket 연결을 관리하므로 별도 connect/ disconnect 호출은 생략합니다.
  }, [selectedChatRoom]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsMobile(true);
        setShowChatList(false);
      } else {
        setIsMobile(false);
        setShowChatList(true);
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

  return (
    <div className={styles.container}>
      {isMobile && (
        <div className={styles.mobileHeader}>
          <button
            className={styles.toggleButton}
            onClick={() => setShowChatList(!showChatList)}
          >
            {showChatList ? "채팅 목록 숨기기" : "채팅 목록 보기"}
          </button>
        </div>
      )}
      <div className={styles.content}>
        {showChatList && (
          <ChatList chatRooms={chatRooms} onSelect={handleChatRoomSelect} />
        )}
        {selectedChatRoom ? (
          <ChatRoom chatRoom={selectedChatRoom} userId={userId} userName={userName} />
        ) : (
          <div className={styles.emptyRoom}>
            <h2>채팅방을 선택해 주세요.</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;