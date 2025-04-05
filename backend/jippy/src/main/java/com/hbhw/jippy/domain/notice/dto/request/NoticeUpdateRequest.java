package com.hbhw.jippy.domain.notice.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Schema(description = "공지사항 수정 요청 DTO")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoticeUpdateRequest {

    @Schema(description = "공지사항 제목", example = "영업시간 변경 안내")
    private String title;

    @Schema(description = "공지사항 내용", example = "매장 영업 시간이 09:00 ~ 18:00으로 변경되었습니다")
    private String content;
}
