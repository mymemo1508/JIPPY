package com.hbhw.jippy.global.fcm;

import com.google.firebase.messaging.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class FCMService {

    public void sendGroupChatNotification(List<String> fcmTokens, String title, String body, Map<String, String> data) {
        List<String> invalidTokens = new ArrayList<>();

        for (String token : fcmTokens) {
            if (token == null || token.isEmpty()) {
                continue;
            }

            try {
                Map<String, String> payloadData = new HashMap<>();
                if (data != null) {
                    payloadData.putAll(data);
                }
                payloadData.put("title", title);
                payloadData.put("body", body);

                Message message = Message.builder()
                        .setToken(token)
                        .putAllData(payloadData)
                        .build();

                String response = FirebaseMessaging.getInstance().send(message);
                log.info("FCM 메시지 전송 성공: {}, token: {}", response, token);

            } catch (FirebaseMessagingException e) {
                if (e.getMessagingErrorCode() == MessagingErrorCode.UNREGISTERED) {
                    log.warn("토큰이 등록되지 않음: {}", token);
                    invalidTokens.add(token);
                } else {
                    log.error("FCM 메시지 전송 실패, token: {}, error: {}", token, e.getMessage());
                }
            } catch (Exception e) {
                log.error("FCM 메시지 전송 중 예상치 못한 오류, token: {}, error: {}", token, e.getMessage());
            }
        }

        if (!invalidTokens.isEmpty()) {
            handleInvalidTokens(invalidTokens);
        }
    }

    private void handleInvalidTokens(List<String> invalidTokens) {
        try {
            log.info("유효하지 않은 토큰 {} 개 발견", invalidTokens.size());
        } catch (Exception e) {
            log.error("유효하지 않은 토큰 처리 중 오류: {}", e.getMessage());
        }
    }
}