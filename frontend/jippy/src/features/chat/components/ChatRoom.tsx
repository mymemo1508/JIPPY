// src/features/chat/components/ChatRoom.tsx
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { fetchMessages } from "@/redux/slices/chatSlice";
import { StoreChat } from "@/features/chat/types/chat";
import { AppDispatch } from "@/redux/store";
import useChatMemberCount from "@/features/chat/hooks/useChatMemberCount";
import styles from "@/features/chat/styles/ChatRoom.module.css";
import { useWebSocket } from "@/features/chat/hooks/useWebSocket";

interface ChatRoomProps {
  chatRoom: StoreChat;
  userId: number;
  userName: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ chatRoom, userId, userName }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { memberCount, loading, error } = useChatMemberCount(chatRoom.storeId);
  
  // WebSocket hook: storeId를 인자로 넘겨 sendMessage 함수를 반환받음
  const { sendMessage } = useWebSocket(chatRoom.storeId.toString());

  useEffect(() => {
    dispatch(fetchMessages({ userId, storeId: chatRoom.storeId }));
  }, [chatRoom, userId, dispatch]);

  return (
    <div className={styles.chatRoomContainer}>
      <div className={styles.header}>
        <h2>채팅방 {chatRoom.storeId}</h2>
        <div className={styles.memberCount}>
          {loading
            ? "로딩 중..."
            : error
            ? "오류 발생"
            : `${memberCount}명 참여 중`}
        </div>
      </div>
      <div className={styles.content}>
        <MessageList storeId={chatRoom.storeId} />
      </div>
      <div className={styles.footer}>
        <MessageInput 
          storeId={chatRoom.storeId} 
          userName={userName} 
          sendMessage={sendMessage} 
        />
      </div>
    </div>
  );
};

export default ChatRoom;
