import React from "react";
import { StoreChat } from "@/features/pwachatting/types/chatting";
import ChatListItem from "./ChatListItem";

interface ChatListProps {
  chatRooms: StoreChat[];
  onSelect: (room: StoreChat) => void;
}

const ChatList: React.FC<ChatListProps> = ({ chatRooms, onSelect }) => {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      <ul className="divide-y divide-gray-200">
        {chatRooms.map((room) => (
          <ChatListItem key={room.storeId} chatRoom={room} onSelect={onSelect} />
        ))}
      </ul>
    </div>
  );
};

export default ChatList;