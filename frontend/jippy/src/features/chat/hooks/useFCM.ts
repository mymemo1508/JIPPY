// src/features/chat/hooks/useFCM.ts
import { useCallback } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";

// 모듈 레벨 플래그: 전체 애플리케이션에서 한 번만 등록하도록 함
let isFCMListenerRegistered = false;

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const useFCM = (userId: number, userType: string) => {
  // 백엔드에 FCM 토큰 저장
  const saveTokenToBackend = useCallback(async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fcm/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, token, userType }),
      });
      if (!response.ok) {
        throw new Error("토큰 저장 실패");
      }
      console.log("FCM 토큰이 백엔드에 저장되었습니다.");
    } catch (error) {
      console.error("토큰 저장 중 에러:", error);
    }
  }, [userId, userType]);

  const initializeFCM = useCallback(async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.warn("FCM 알림 권한이 거부되었습니다.");
        return;
      }

      // Firebase 앱은 한 번만 초기화
      let app;
      if (!getApps().length) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApps()[0];
      }
      const messaging: Messaging = getMessaging(app);
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      const token = await getToken(messaging, { vapidKey });
      console.log("FCM 토큰:", token);
      if (token) {
        await saveTokenToBackend(token);
      }

      // 모듈 레벨 플래그를 사용해 리스너가 이미 등록되어 있는지 확인
      if (!isFCMListenerRegistered) {
        onMessage(messaging, (payload) => {
          console.log("FCM 메시지 수신:", payload);
          // 예를 들어, payload.data.senderId를 이용해 자신의 메시지면 무시할 수 있습니다.
          if (payload?.data?.senderId && payload.data.senderId === String(userId)
            && payload.data.userType === userType) {
            console.log("자신이 보낸 메시지이므로 FCM 알림 무시");
            return;
          }
          // 다른 사용자의 메시지에 대해서만 필요한 처리를 진행합니다.
        });
        isFCMListenerRegistered = true;
      }
    } catch (error) {
      console.error("FCM 초기화 에러:", error);
    }
  }, [saveTokenToBackend, userId, userType]);

  return { initializeFCM };
};

export default useFCM;
