importScripts('https://www.gstatic.com/firebasejs/11.3.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.3.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAeyyqdIG8ALszCkNP3PG1uW4Gprhbje4A",
  authDomain: "jippy-23ce2.firebaseapp.com",
  projectId: "jippy-23ce2",
  storageBucket: "jippy-23ce2.firebasestorage.app",
  messagingSenderId: "70892831219",
  appId: "1:70892831219:web:71e8d19f9d4b52ee9f5286",
  measurementId: "G-891SKEBEDW"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  // payload.data로 접근하도록 수정
  const notif = payload.data || {};
  const title = notif.title || "새 메시지 도착";
  const body = notif.body || "";
  const icon = notif.image || '/icons/pwa.png';
  
  // tag에 messageId를 사용하면 동일한 메시지는 하나로 묶임
  const tag = payload.messageId || 'default-tag';

  const options = {
    body,
    icon,
    tag,
  };

  self.registration.showNotification(title, options);
});
