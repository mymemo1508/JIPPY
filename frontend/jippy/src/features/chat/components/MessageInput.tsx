// src/features/chat/components/MessageInput.tsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addReceivedMessage } from "@/redux/slices/chatSlice";
import styles from "@/features/chat/styles/MessageInput.module.css";
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

    console.log("전송 버튼 클릭됨:", message);
    const chatMessage = {
      senderId: userName,
      messageId: uuidv4(), // 고유한 ID 생성
      messageContent: message,
      timestamp: new Date().toISOString(),
      messageType: "text",
    };

    // Optimistic Update: 내가 보낸 메시지를 바로 채팅창에 추가
    dispatch(addReceivedMessage({ storeId, message: chatMessage }));

    // WebSocket을 통해 메시지 전송 (백엔드도 FCM 알림 전송)
    sendMessage(chatMessage);
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className={styles.messageInputContainer}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyPress}
        className={styles.inputField}
        placeholder="메시지를 입력하세요."
      />
      <button onClick={handleSend} className={styles.sendButton}>
        전송
      </button>
    </div>
  );
};

export default MessageInput;
