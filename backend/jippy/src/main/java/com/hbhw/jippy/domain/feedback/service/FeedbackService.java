package com.hbhw.jippy.domain.feedback.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hbhw.jippy.domain.dashboard.dto.response.staff.StoreSalaryResponse;
import com.hbhw.jippy.domain.feedback.dto.request.FeedbackRequest;
import com.hbhw.jippy.domain.feedback.dto.response.FeedbackResponse;
import com.hbhw.jippy.domain.feedback.entity.Feedback;
import com.hbhw.jippy.domain.feedback.repository.FeedbackRepository;
import com.hbhw.jippy.domain.feedback.enums.Category;
import com.hbhw.jippy.domain.store.entity.StoreCoordinates;
import com.hbhw.jippy.domain.store.repository.StoreCoordinatesRepository;
import com.hbhw.jippy.global.code.CommonErrorCode;
import com.hbhw.jippy.global.error.BusinessException;
import com.hbhw.jippy.utils.DateTimeUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FeedbackService {
    private final FeedbackRepository feedbackRepository;
    private final NotificationService notificationService;
    private final StoreCoordinatesRepository storeCoordinatesRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    private static final double EARTH_RADIUS = 6371e3; // 지구 반경 (미터 단위)
    private static final double ERROR_RANGE = 1000.0;

    private static final String CASH_PREFIX = "feedback";

    /**
     * 고객 피드백 등록
     */
    public void createFeedback(int storeId, FeedbackRequest request) {
        // 1) requestId 유효성 체크
        if (request.getRequestId() == null || request.getRequestId().isEmpty()) {
            // 상황에 따라 예외처리 혹은 내부에서 UUID 생성 등
            throw new IllegalArgumentException("requestId is required");
        }

        // 2) Redis에 해당 requestId가 이미 존재하는지(중복 요청인지) 체크
        //    setIfAbsent == true -> 새 요청
        //    setIfAbsent == false -> 이미 존재(중복 요청)
        Boolean isNewRequest = redisTemplate.opsForValue()
                .setIfAbsent(request.getRequestId(), "LOCK", 24, TimeUnit.HOURS);

        if (Boolean.FALSE.equals(isNewRequest)) {
            // 이미 동일 requestId가 Redis에 존재 -> 중복 요청
            throw new RuntimeException("중복 요청입니다.");
        }

        // 좌표 오차 범위 내에 있는지 확인
        Optional<StoreCoordinates> storeCoordinatesOptional = storeCoordinatesRepository.findByStoreId(storeId);
        if (!storeCoordinatesOptional.isPresent()) {
            throw new BusinessException(CommonErrorCode.NOT_FOUND, "스토어 좌표를 찾을 수 없습니다." + " " + storeId);
        }
        StoreCoordinates storeCoordinates = storeCoordinatesOptional.get();
        if (!isWithinRange(storeCoordinates.getLatitude(), storeCoordinates.getLongitude(),
                Double.parseDouble(request.getLatitude()), Double.parseDouble(request.getLongitude()), ERROR_RANGE)) {
            throw new BusinessException(CommonErrorCode.OUT_OF_RANGE, "GPS 범위를 벗어났습니다.");
        }

        Feedback feedback = Feedback.builder()
                .storeId(storeId)
                .category(request.getCategory())
                .content(request.getContent())
                .createdAt(DateTimeUtils.nowString())
                .build();
        Feedback saved = feedbackRepository.save(feedback);

        // 4) LIVE 카테고리면 사장님에게 알림
        if (saved.getCategory() == Category.LIVE) {
            notificationService.notifyOwner(saved.getStoreId(), saved.getContent());
        }

        feedbackRepository.save(feedback); // 저장만 수행, 반환 없음
    }


    /**
     * 매장 전체 피드백 조회
     */
    public List<FeedbackResponse> getFeedbacksByStore(int storeId) {
        String key = CASH_PREFIX + storeId;
        String cashJsonData = redisTemplate.opsForValue().get(key);

        try {
            if(cashJsonData != null){
                log.info("totalStoreSalary : cash hit!!");
                return objectMapper.readValue(cashJsonData, new TypeReference<>() {
                });
            }

            List<Feedback> feedbackList = feedbackRepository.findByStoreId(storeId);
            feedbackList.sort(Comparator.comparing(Feedback::getCreatedAt).reversed());
            List<FeedbackResponse> feedbackResponseList = feedbackList.stream()
                    .map(this::toResponse)
                    .toList();

            String jsonData = objectMapper.writeValueAsString(feedbackResponseList); // 객체 → JSON 변환
            redisTemplate.opsForValue().set(key, jsonData, Duration.ofSeconds(60 * 5));
            log.info("totalStoreSalary : db search");
            return feedbackResponseList;
        } catch (Exception e) {
            log.error("feedback error : {}", e.getClass());
            throw new BusinessException(CommonErrorCode.INTERNAL_SERVER_ERROR, "피드백 서버에러 발생");
        }
    }


    /**
     * 카테고리별 피드백 조회
     */
    public List<FeedbackResponse> getFeedbacksByCategory(int storeId, Category category) {
        List<Feedback> feedbackList = feedbackRepository.findByStoreIdAndCategory(storeId, category);
        feedbackList.sort(Comparator.comparing(Feedback::getCreatedAt).reversed());
        return feedbackList.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }


    /**
     * 피드백 삭제 (점주 권한)
     */
    public void deleteFeedback(int storeId, Long feedbackId) {
        Feedback feedback = feedbackRepository.findByStoreIdAndId(storeId, feedbackId);

        // 다른 매장의 피드백을 지우지 못하도록 체크
        if (feedback.getStoreId() != storeId) {
            throw new RuntimeException("해당 매장의 피드백이 아닙니다.");
        }

        feedbackRepository.delete(feedback); // 삭제
    }

    private FeedbackResponse toResponse(Feedback feedback) {
        return FeedbackResponse.builder()
                .id(feedback.getId())
                .storeId(feedback.getStoreId())
                .category(feedback.getCategory())
                .content(feedback.getContent())
                .createdAt(feedback.getCreatedAt())
                .build();
    }

    private boolean isWithinRange(double lat1, double lon1, double lat2, double lon2, double range) {
        double latRad1 = Math.toRadians(lat1);
        double lonRad1 = Math.toRadians(lon1);
        double latRad2 = Math.toRadians(lat2);
        double lonRad2 = Math.toRadians(lon2);

        double dLat = latRad2 - latRad1;
        double dLon = lonRad2 - lonRad1;

        double a = Math.pow(Math.sin(dLat / 2), 2) +
                Math.cos(latRad1) * Math.cos(latRad2) *
                        Math.pow(Math.sin(dLon / 2), 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return (EARTH_RADIUS * c) <= range;
    }

}
