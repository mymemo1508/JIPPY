package com.hbhw.jippy.global.pagination.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "페이지네이션 요청 DTO")
public class PaginationRequest {

    @Schema(description = "페이지 번호 (0부터 시작)", example = "0", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull
    @Builder.Default
    private Integer page = 0;

    @Schema(description = "페이지 크기", example = "10", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull
    @Builder.Default
    private Integer pageSize = 10;

    @Schema(description = "정렬 기준", example = "createdAt")
    @Builder.Default
    private String sortBy = "createdAt";

    @Schema(description = "정렬 방향 (ASC, DESC)", example = "DESC")
    @Pattern(regexp = "^(ASC|DESC)$", message = "정렬 방향은 ASC 또는 DESC만 가능합니다")
    @Builder.Default
    private String direction = "DESC";

    @Schema(description = "시작 날짜", example = "2025-02-05 00:00:00")
    private String startDate;

    @Schema(description = "끝 날짜", example = "2025-02-06 00:00:00")
    private String endDate;

    public Pageable toPageable() {
        Sort.Direction dir = Sort.Direction.fromString(direction.toUpperCase());
        return PageRequest.of(page, pageSize, Sort.by(dir, sortBy));
    }
}
