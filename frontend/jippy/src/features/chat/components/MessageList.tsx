import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Message } from "@/features/chat/types/chat";
import { formatTimestamp } from "@/utils/formatDate";
import styles from "@/features/chat/styles/MessageList.module.css";

interface MessageListProps {
  storeId: number;
}

const MessageList: React.FC<MessageListProps> = ({ storeId }) => {
  const messages: Message[] = useSelector(
    (state: { chat: { messages: { [key: number]: Message[] } } }) =>
      state.chat.messages[storeId] || []
  );

  // 스크롤 제어를 위한 ref (리스트 하단의 더미 엘리먼트)
  const dummyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dummyRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={styles.messageListContainer}>
      <ul className={styles.messageList}>
        {messages.map((msg: Message, index: number) => (
          <li key={index} className={styles.messageItem}>
            <div className={styles.messageHeader}>{msg.senderId}</div>
            <div>{msg.messageContent}</div>
            <div className={styles.messageTimestamp}>
              {formatTimestamp(msg.timestamp)}
            </div>
          </li>
        ))}
      </ul>
      {/* 이 더미 엘리먼트로 스크롤을 제어 */}
      <div ref={dummyRef} />
    </div>
  );
};

export default MessageList;
