import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addReceivedMessage } from "@/redux/slices/chatSlice";
import { Send } from 'lucide-react';
import { v4 as uuidv4 } from "uuid";

interface MessageInputProps {
  storeId: number;
  userName: string;
  sendMessage: (message: {
    senderId: string;
    messageId: string;
    messageContent: string;
    timestamp: string;
    messageType: string;
  }) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ storeId, userName, sendMessage }) => {
  const [message, setMessage] = useState("");
  const dispatch = useDispatch();

  const handleSend = () => {
    if (message.trim() === "") return;

    const chatMessage = {
      senderId: userName,
      messageId: uuidv4(),
      messageContent: message,
      timestamp: new Date().toISOString(),
      messageType: "text",
    };

    dispatch(addReceivedMessage({ storeId, message: chatMessage }));
    sendMessage(chatMessage);
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="p-4 bg-white border-t border-gray-200">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="메시지를 입력하세요"
        />
        <button 
          onClick={handleSend} 
          className="p-2 rounded-full bg-orange-500 text-white active:bg-orange-600 disabled:bg-gray-300"
          disabled={message.trim() === ""}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;