import React from "react";
import { StoreChat } from "@/features/chat/types/chat";
import ChatListItem from "./ChatListItem";
import styles from "@/features/chat/styles/ChatList.module.css";

interface ChatListProps {
  chatRooms: StoreChat[];
  onSelect: (room: StoreChat) => void;
}

const ChatList: React.FC<ChatListProps> = ({ chatRooms, onSelect }) => {
  return (
    <div className={styles.chatList}>
      <div className={styles.header}>채팅방 목록</div>
      <ul className={styles.list}>
        {chatRooms.map((room) => (
          <ChatListItem key={room.storeId} chatRoom={room} onSelect={onSelect} />
        ))}
      </ul>
    </div>
  );
};

export default ChatList;
