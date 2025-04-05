export interface Message {
    senderId: string;
    messageId: string;
    messageContent: string;
    timestamp: string;
    messageType: string;
  }
  
  export interface StoreChat {
    id: string;
    storeId: number;
    messages: Message[];
  }
  