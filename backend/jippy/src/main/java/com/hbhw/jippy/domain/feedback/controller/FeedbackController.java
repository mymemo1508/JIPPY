package com.hbhw.jippy.domain.feedback.controller;

import com.hbhw.jippy.domain.feedback.dto.request.FeedbackRequest;
import com.hbhw.jippy.domain.feedback.dto.response.FeedbackResponse;
import com.hbhw.jippy.domain.feedback.enums.Category;
import com.hbhw.jippy.domain.feedback.service.FeedbackService;
import com.hbhw.jippy.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Tag(name = "피드백 API", description = "매장 피드백 등록 및 조회/삭제 관련 API")
@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    // Redis에 저장
    private static final Set<String> processedRequestIds = Collections.newSetFromMap(new ConcurrentHashMap<>());


    @Operation(summary = "고객 피드백 등록", description = "고객이 특정 매장에 피드백을 등록합니다.")
    @PostMapping("/{storeId}/create")
    //@PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<Boolean> createFeedback(
            @Parameter(description = "매장 ID") @PathVariable int storeId,
            @RequestBody FeedbackRequest request
    ) {
        // 1) requestId가 없는 경우(프론트에서 미처 생성 안 한 경우)
        if (request.getRequestId() == null) {
            request.setRequestId(UUID.randomUUID().toString());
        }

        synchronized (this) {
            if (processedRequestIds.contains(request.getRequestId())) {
                // 중복 요청이므로 에러 또는 중복임을 알려줄 수 있음
                return ApiResponse.success(null);
            }
            // 중복이 아니면 등록
            processedRequestIds.add(request.getRequestId());
        }

        feedbackService.createFeedback(storeId, request);
        return ApiResponse.success(HttpStatus.OK);
    }

    @Operation(summary = "매장 피드백 전체 조회", description = "점주가 특정 매장의 모든 피드백을 조회합니다.")
    @GetMapping("/{storeId}/select")
    //@PreAuthorize("hasRole('OWNER')")
    public ApiResponse<List<FeedbackResponse>> getFeedbacks(
            @Parameter(description = "매장 ID") @PathVariable Integer storeId
    ) {
        List<FeedbackResponse> responseList = feedbackService.getFeedbacksByStore(storeId);
        return ApiResponse.success(responseList);
    }

    @Operation(summary = "카테고리별 피드백 조회", description = "점주가 특정 카테고리의 피드백을 조회합니다.")
    @GetMapping("/{storeId}/select/{category}")
    //@PreAuthorize("hasRole('OWNER')")
    public ApiResponse<List<FeedbackResponse>> getFeedbacksByCategory(
            @Parameter(description = "매장 ID") @PathVariable Integer storeId,
            @Parameter(description = "피드백 카테고리 (SERVICE, PRODUCT, ETC)") @PathVariable Category category
    ) {
        List<FeedbackResponse> responseList = feedbackService.getFeedbacksByCategory(storeId, category);
        return ApiResponse.success(responseList);
    }

    @Operation(summary = "피드백 삭제", description = "점주가 특정 피드백을 삭제합니다.")
    @DeleteMapping("/{storeId}/delete/{feedbackId}")
    //@PreAuthorize("hasRole('OWNER')")
    public ApiResponse<Void> deleteFeedback(
            @Parameter(description = "매장 ID") @PathVariable Integer storeId,
            @Parameter(description = "삭제할 피드백 ID") @PathVariable Long feedbackId
    ) {
        feedbackService.deleteFeedback(storeId, feedbackId);
        return ApiResponse.success(HttpStatus.OK);
    }
}
