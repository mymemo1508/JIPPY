// service-worker.js
self.addEventListener("fetch", event => {
    // 다른 출처의 리소스 요청 처리
    if (event.request.url.startsWith("https://other-domain.com")) {
      event.respondWith(
        caches.match(event.request)
          .then(response => {
            if (response) {
              return response; // 캐시된 응답 반환
            }
            
            return fetch(event.request.clone(), {
              mode: "cors",  // CORS 모드 설정
              credentials: "same-origin"
            }).then(response => {
              // 유효한 응답만 캐시
              if (!response || response.status !== 200 || response.type !== "basic") {
                return response;
              }
              
              // 응답을 캐시에 저장
              const responseToCache = response.clone();
              caches.open("cross-origin-cache").then(cache => {
                cache.put(event.request, responseToCache);
              });
              
              return response;
            });
          })
      );
    }
  });