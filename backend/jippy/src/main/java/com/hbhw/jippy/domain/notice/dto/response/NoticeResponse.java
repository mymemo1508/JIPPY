package com.hbhw.jippy.domain.notice.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Schema(description = "공지사항 정보 응답")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoticeResponse {

    @Schema(description = "공지사항 아이디", example = "1")
    private Long noticeId;

    @Schema(description = "매장 아이디", example = "1")
    private Integer storeId;

    @Schema(description = "공지사항 제목", example = "딸기 시즌 신메뉴 출시 공지사항")
    private String title;

    @Schema(description = "공지사항 내용", example = "딸기 시즌 신메뉴가 출시되었습니다 레시피를 숙지하여 출근하시길 바랍니다")
    private String content;

    @Schema(description = "생성 날짜", example = "2025-02-05 15:20:30")
    private String createdAt;

    @Schema(description = "작성자", example = "카리나")
    private String author;
}
