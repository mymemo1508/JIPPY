package com.hbhw.jippy.domain.feedback.dto.response;

import com.hbhw.jippy.domain.feedback.enums.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FeedbackResponse {

    private Long id;
    private int storeId;
    private Category category;
    private String content;
    private String createdAt;
}
