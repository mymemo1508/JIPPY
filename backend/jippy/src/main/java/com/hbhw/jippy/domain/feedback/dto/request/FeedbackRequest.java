package com.hbhw.jippy.domain.feedback.dto.request;

import com.hbhw.jippy.domain.feedback.enums.Category;
import lombok.Getter;
import lombok.Setter;

/**
 * 피드백 작성 시 클라이언트가 보내는 데이터
 */
@Getter
@Setter
public class FeedbackRequest {

    private Category category;  // 카테고리(enum)
    private String content;     // 피드백 내용
    private String createdAt; // 생성날짜
    private String requestId;   // 프론트에서 생성한 UUID
    private String longitude;
    private String latitude;
}