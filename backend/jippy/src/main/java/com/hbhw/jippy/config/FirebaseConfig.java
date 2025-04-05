package com.hbhw.jippy.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Configuration
public class FirebaseConfig {

    // application.properties
    @Value("${firebase.private_key_id}")
    private String fireBasePrivateKeyId;

    @Value("${firebase.private-key}")
    private String firebasePrivateKey;

    @PostConstruct
    public void initFirebase() throws IOException {
        try (InputStream templateStream =
                     getClass().getResourceAsStream("/serviceAccountKey.json")) {

            if (templateStream  == null) {
                throw new RuntimeException("Firebase Service Account Key not found.");
            }

            // 2) JSON 템플릿 내용을 문자열로 변환
            String templateJson = new String(templateStream.readAllBytes(), StandardCharsets.UTF_8);

            // 3) PRIVATE_KEY_PLACEHOLDER 부분을 실제 private key로 치환
            String replacedJson;
            replacedJson = templateJson.replace("PRIVATE_KEY_ID_PLACEHOLDER", fireBasePrivateKeyId);
            replacedJson = templateJson.replace("PRIVATE_KEY_PLACEHOLDER", firebasePrivateKey);


            // 4) 치환된 전체 JSON 문자열을 다시 InputStream 으로 만들어 파이어베이스 초기화
            try (InputStream serviceAccount = new ByteArrayInputStream(replacedJson.getBytes(StandardCharsets.UTF_8))) {
                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .build();

                if (FirebaseApp.getApps().isEmpty()) {
                    FirebaseApp.initializeApp(options);
                }
            }
        }
    }
}

