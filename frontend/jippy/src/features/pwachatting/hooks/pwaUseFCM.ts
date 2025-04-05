import { useEffect, useCallback } from "react";
import { getMessaging, getToken, MessagePayload } from "firebase/messaging";
import { initializeApp, getApps } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAeyyqdIG8ALszCkNP3PG1uW4Gprhbje4A",
  authDomain: "jippy-23ce2.firebaseapp.com",
  projectId: "jippy-23ce2",
  storageBucket: "jippy-23ce2.firebasestorage.app",
  messagingSenderId: "70892831219",
  appId: "1:70892831219:web:71e8d19f9d4b52ee9f5286",
  measurementId: "G-891SKEBEDW"
};

const getCookieValue = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

export const usePwaFCM = () => {
  const userId = getCookieValue('userId');
  const userType = getCookieValue('staffType');

  const saveTokenToBackend = useCallback(async (token: string) => {
    try {
      if (!userId || !userType) {
        console.log('사용자 정보 없음:', { userId, userType });
        throw new Error("사용자 정보가 없습니다.");
      }
      console.log('토큰 저장 시도:', { userId, userType, token });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fcm/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: parseInt(userId),
          token,
          userType,
          deviceType: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 'mobile' : 'web'
        }),
      });

      const responseData = await response.text();
      console.log('서버 응답:', {
        status: response.status,
        data: responseData
      });
    } catch (error) {
      console.error("토큰 저장 중 에러:", error);
      throw error;
    }
  }, [userId, userType]);

  useEffect(() => {
    let messaging: import('firebase/messaging').Messaging;
  
    const initializeFCM = async () => {
      try {
        if (!userId || !userType) {
          console.log('사용자 인증 정보 없음');
          return;
        }
  
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
          console.log('Push 알림 미지원 브라우저');
          return;
        }
  
        let app;
        if (!getApps().length) {
          app = initializeApp(firebaseConfig);
        } else {
          app = getApps()[0];
        }
        
        messaging = getMessaging(app);
  
        const swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('Service Worker 등록 완료:', swRegistration);
  
        const permission = await Notification.requestPermission();
        console.log('알림 권한 상태:', permission);
  
        if (permission === 'granted') {
          try {
            const currentToken = await getToken(messaging, {
              vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
              serviceWorkerRegistration: swRegistration
            });
  
            if (currentToken) {
              console.log('FCM 토큰:', currentToken);
              await saveTokenToBackend(currentToken);
            }

            setInterval(async () => {
              const refreshedToken = await getToken(messaging, {
                vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
                serviceWorkerRegistration: swRegistration
              });
              
              if (refreshedToken !== currentToken) {
                console.log('FCM 토큰 갱신됨:', refreshedToken);
                await saveTokenToBackend(refreshedToken);
              }
            }, 1000 * 60 * 60);
  
          } catch (tokenError) {
            console.error('FCM 토큰 생성 실패:', tokenError);
          }
        }
  
        const { onMessage } = await import('firebase/messaging');
        onMessage(messaging, (payload: MessagePayload) => {
          console.log('포그라운드 메시지 수신:', payload);
          
          if ('Notification' in window && Notification.permission === 'granted') {
            const title = payload.data?.title || 'JIPPY Alert';
            const body = payload.data?.body || '새로운 메시지가 도착했습니다.';
            
            const notification = new Notification(title, { 
              body,
              icon: '/icons/pwa.png',
              badge: '/icons/badge.png',
              tag: payload.data?.messageId,
              requireInteraction: true, 
              data: payload.data
            });
  
            notification.onclick = () => {
              window.focus();
              notification.close();
            };
          }
        });
  
        console.log('FCM 초기화 완료');
  
      } catch (error) {
        console.error('FCM 초기화 실패:', error);
      }
    };
  
    initializeFCM();
  
    return () => {
      // cleanup 로직
    };
  }, [userId, userType, saveTokenToBackend]);
};