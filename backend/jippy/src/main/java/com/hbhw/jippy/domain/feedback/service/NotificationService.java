package com.hbhw.jippy.domain.feedback.service;

import com.google.firebase.messaging.*;
import com.hbhw.jippy.domain.storeuser.service.staff.StoreStaffService;
import com.hbhw.jippy.domain.user.entity.UserOwner;
import com.hbhw.jippy.domain.user.repository.UserOwnerRepository;
import com.hbhw.jippy.global.fcm.FCMService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final StoreStaffService storeStaffService;
    private final FCMService fcmService;



    /**
     * 웹(PWA) 브라우저용 FCM 알림 전송
     * @param storeId 매장 ID
     * @param content 피드백 내용
     */
    public void notifyOwner(int storeId, String content) {
        // 1) 사장님(Owner)의 FCM 토큰 조회 (DB나 다른 저장소에서 가져옴)
        List<String> fcmTokens = storeStaffService.getAllChatMemberFcmTokens(storeId);

        // 2. 전달할 데이터 구성 (추가 정보가 필요하면 여기서 확장)
        Map<String, String> data = new HashMap<>();
        // 3. FCM 알림 전송 (데이터 메시지 전송)
        if (!fcmTokens.isEmpty()) {
            fcmService.sendGroupChatNotification(fcmTokens, "실시간 피드백 알림", content, data);
        }
    }


}
