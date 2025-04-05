// src/features/chat/hooks/useWebSocket.ts
import { useEffect, useState, useCallback } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useDispatch } from "react-redux";
import { addReceivedMessage } from "@/redux/slices/chatSlice";
import { Message } from "@/features/chat/types/chat";

const SOCKET_URL = `${process.env.NEXT_PUBLIC_API_URL}/ws-chat`; // 백엔드 엔드포인트

export const useWebSocket = (storeId: string) => {
  const dispatch = useDispatch();
  const [stompClient, setStompClient] = useState<Client | null>(null);

  useEffect(() => {
    if (!storeId) return;
    const socket = new SockJS(SOCKET_URL);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("✅ WebSocket 연결 성공!");
        client.subscribe(`/topic/chat/${storeId}`, (message) => {
          const newMsg: Message = JSON.parse(message.body);
          console.log("서버에서 받은 메시지:", newMsg);
          // Redux 상태 업데이트: 실시간으로 채팅창 갱신됨
          dispatch(addReceivedMessage({ storeId: Number(storeId), message: newMsg }));
        });
      },
      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
        console.error("Additional details: " + frame.body);
      },
    });
    client.activate();
    setStompClient(client);

    return () => {
      client.deactivate();
    };
  }, [storeId, dispatch]);

  // sendMessage는 Message 객체를 인자로 받아 전송합니다.
  const sendMessage = useCallback(
    (message: Message) => {
      console.log("sendMessage 호출됨. 연결 상태:", stompClient?.active);
      if (stompClient && stompClient.active) {
        console.log("WebSocket 연결 상태: 전송 진행", message);
        stompClient.publish({
          destination: `/app/chat/${storeId}/send`,
          body: JSON.stringify(message),
        });
      } else {
        console.warn("WebSocket이 연결되어 있지 않습니다.");
      }
    },
    [stompClient, storeId]
  );

  return { sendMessage };
};
