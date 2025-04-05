import { useEffect } from "react";
import { useDispatch } from "react-redux";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { fetchMessages } from "@/redux/slices/chatSlice";
import { StoreChat } from "@/features/pwachatting/types/chatting";
import { AppDispatch } from "@/redux/store";
import { useWebSocket } from "@/features/chat/hooks/useWebSocket";

interface ChatRoomProps {
  chatRoom: StoreChat;
  userId: number;
  userName: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ chatRoom, userId, userName }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { sendMessage } = useWebSocket(chatRoom.storeId.toString());

  useEffect(() => {
    dispatch(fetchMessages({ userId, storeId: chatRoom.storeId }));
  }, [chatRoom, userId, dispatch]);

  return (
    <>
      <div className="h-screen fixed inset-0 flex flex-col bg-gray-50">
        <div className="flex-1 overflow-hidden">
          <MessageList storeId={chatRoom.storeId} />
        </div>
        
        <div className="flex-none border-t">
          <MessageInput 
            storeId={chatRoom.storeId} 
            userName={userName} 
            sendMessage={sendMessage} 
          />
        </div>
      </div>
    </>
  );
};

export default ChatRoom;