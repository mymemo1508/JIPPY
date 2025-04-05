package com.hbhw.jippy.global.pagination.dto.response;

import com.hbhw.jippy.global.pagination.dto.request.PaginationRequest;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.Collections;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "페이지네이션 응답 DTO")
public class PaginationResponse<T> {

    @Schema(description = "데이터 리스트")
    private List<T> content;

    @Schema(description = "현재 페이지 번호", example = "0")
    private Integer page;

    @Schema(description = "작성자", example = "카리나")
    private String author;

    @Schema(description = "시작 날짜", example = "2025-02-06 00:00:00")
    private String startDate;

    @Schema(description = "끝 날짜", example = "2025-02-07 00:00:00")
    private String endDate;

    @Schema(description = "페이지 크기", example = "10")
    private Integer pageSize;

    @Schema(description = "총 페이지 수", example = "10")
    private Integer totalPages;

    @Schema(description = "총 데이터 수", example = "101")
    private long totalElements;

    @Schema(description = "첫 페이지 여부", example = "true")
    private Boolean isFirst;

    @Schema(description = "마지막 페이지 여부", example = "false")
    private Boolean isLast;

    public static <T> PaginationResponse<T> of(Page<T> page, PaginationRequest request) {
        return PaginationResponse.<T>builder()
                .content(page.getContent() != null ? page.getContent() : Collections.emptyList())
                .page(page.getNumber())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .pageSize(page.getSize())
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .isFirst(page.isFirst())
                .isLast(page.isLast())
                .build();
    }
}
