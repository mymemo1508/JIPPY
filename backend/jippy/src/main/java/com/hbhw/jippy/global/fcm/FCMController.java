package com.hbhw.jippy.global.fcm;

import com.hbhw.jippy.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/fcm")
@RequiredArgsConstructor
public class FCMController {

    private final FCMTokenService fcmTokenService;
    @PostMapping("/token")
    public ApiResponse<?> updateFcmToken(@RequestBody FCMTokenRequest request) {
        fcmTokenService.updateToken(request);
        return ApiResponse.success("FCM 토큰이 업데이트되었습니다.");
    }
}
