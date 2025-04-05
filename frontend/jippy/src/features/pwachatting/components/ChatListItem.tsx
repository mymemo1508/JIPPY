import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { StoreChat } from "@/features/pwachatting/types/chatting";
import { formatTimestamp } from "@/utils/formatDate";
import useRecentMessage from "@/features/chat/hooks/useRecentMessage";

interface ChatListItemProps {
  chatRoom: StoreChat;
  onSelect: (room: StoreChat) => void;
}

const ChatListItem: React.FC<ChatListItemProps> = ({ chatRoom, onSelect }) => {
  const reduxMessages = useSelector(
    (state: RootState) => state.chat.messages[chatRoom.storeId] || []
  );

  const { recentMessage, loading, error } = useRecentMessage(chatRoom.storeId);
  const latestMessage =
    reduxMessages.length > 0 ? reduxMessages[reduxMessages.length - 1] : recentMessage;

  return (
    <li 
      className="px-4 py-3 bg-white active:bg-gray-100 cursor-pointer transition-colors"
      onClick={() => onSelect(chatRoom)}
    >
      <div className="flex flex-col gap-1">
        <div className="font-medium text-gray-900">
          채팅방 {chatRoom.storeId}
        </div>
        {loading && reduxMessages.length === 0 ? (
          <div className="text-sm text-gray-500">로딩 중...</div>
        ) : error && reduxMessages.length === 0 ? (
          <div className="text-sm text-red-500">오류 발생</div>
        ) : latestMessage ? (
          <div className="flex justify-between items-start">
            <span className="text-sm text-gray-600 line-clamp-1 flex-1">
              {latestMessage.messageContent}
            </span>
            <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
              {formatTimestamp(latestMessage.timestamp)}
            </span>
          </div>
        ) : (
          <div className="text-sm text-gray-500">메시지가 없습니다.</div>
        )}
      </div>
    </li>
  );
};

export default ChatListItem;