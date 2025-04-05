import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Message } from "@/features/pwachatting/types/chatting";
import { formatTimestamp } from "@/utils/formatDate";

interface MessageListProps {
  storeId: number;
}

const MessageList: React.FC<MessageListProps> = ({ storeId }) => {
  const messages: Message[] = useSelector(
    (state: { chat: { messages: { [key: number]: Message[] } } }) =>
      state.chat.messages[storeId] || []
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
  }, [messages]);

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex flex-col p-4 space-y-4 pt-[80px]">
        {messages.map((message) => (
          <div key={message.messageId} className="flex flex-col max-w-[80%] self-start">
            <span className="text-sm text-gray-600 mb-1">{message.senderId}</span>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="text-gray-800">{message.messageContent}</p>
            </div>
            <span className="text-xs text-gray-400 mt-1">
              {formatTimestamp(message.timestamp)}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;