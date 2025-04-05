// src/types/chat.ts

/**
 * Message Entity
 * - senderId: 메시지를 보낸 사용자 ID
 * - messageId: 메시지의 고유 ID
 * - messageContent: 메시지 내용
 * - timestamp: 메시지가 전송된 시각 (ISO 형식 등 문자열로 관리)
 * - messageType: 메시지 타입 (텍스트, 이미지 등)
 */
export interface Message {
    senderId: string;
    messageId: string;
    messageContent: string;
    timestamp: string;
    messageType: string;
  }
  
  /**
   * StoreChat Entity
   * - id: 채팅방의 고유 id (MongoDB ObjectId 등 문자열)
   * - storeId: 상점 또는 채팅방 식별자 (정수)
   * - messages: 채팅방에 속한 메시지 목록
   */
  export interface StoreChat {
    id: string;
    storeId: number;
    messages: Message[];
  }
  