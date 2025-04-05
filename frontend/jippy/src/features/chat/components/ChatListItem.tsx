// src/features/chat/components/ChatListItem.tsx
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { StoreChat } from "@/features/chat/types/chat";
import { formatTimestamp } from "@/utils/formatDate";
import styles from "@/features/chat/styles/ChatListItem.module.css";
import useRecentMessage from "@/features/chat/hooks/useRecentMessage";

interface ChatListItemProps {
  chatRoom: StoreChat;
  onSelect: (room: StoreChat) => void;
}

const ChatListItem: React.FC<ChatListItemProps> = ({ chatRoom, onSelect }) => {
  // Redux에서 해당 채팅방의 메시지들을 구독합니다.
  const reduxMessages = useSelector(
    (state: RootState) => state.chat.messages[chatRoom.storeId] || []
  );

  // DB에 저장된 최신 메시지를 가져오는 훅 (페이지 첫 로딩 시 사용)
  const { recentMessage, loading, error } = useRecentMessage(chatRoom.storeId);

  // Redux에 저장된 메시지가 있다면 그 마지막 메시지를, 없으면 DB에서 가져온 최신 메시지를 사용합니다.
  const latestMessage =
    reduxMessages.length > 0 ? reduxMessages[reduxMessages.length - 1] : recentMessage;

  return (
    <li className={styles.listItem} onClick={() => onSelect(chatRoom)}>
      <div className={styles.roomTitle}>채팅방 {chatRoom.storeId}</div>
      {loading && reduxMessages.length === 0 ? (
        <div className={styles.preview}>로딩 중...</div>
      ) : error && reduxMessages.length === 0 ? (
        <div className={styles.preview}>오류 발생</div>
      ) : latestMessage ? (
        <div className={styles.preview}>
          <span className={styles.messageContent}>
            {latestMessage.messageContent}
          </span>
          <span className={styles.timestamp}>
            {formatTimestamp(latestMessage.timestamp)}
          </span>
        </div>
      ) : (
        <div className={styles.preview}>메시지가 없습니다.</div>
      )}
    </li>
  );
};

export default ChatListItem;
