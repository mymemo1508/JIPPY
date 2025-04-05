package com.hbhw.jippy.domain.notice.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Schema(description = "공지사항 생성 요청 DTO")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoticeCreateRequest {

    @Schema(description = "공지사항 제목", example = "딸기 시즌 신메뉴 출시 공지사항")
    private String title;

    @Schema(description = "공지사항 내용", example = "딸기 시즌 신메뉴가 출시되었습니다 레시피를 숙지하여 출근하시길 바랍니다")
    private String content;

    @Schema(description = "작성자", example = "카리나")
    private String author;
}
