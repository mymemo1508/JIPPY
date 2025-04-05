package com.hbhw.jippy.domain.stock.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Schema(description = "재고 상세 정보 요청")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class StockDetailCreateUpdateRequest {

    @Schema(description = "재고 수량", example = "3")
    private Integer stockCount;

    @Schema(description = "재고별 크기", example = "100")
    private Integer stockUnitSize;

    @Schema(description = "재고 단위 크기", example = "g")
    private String stockUnit;

    @Schema(description = "삭제 이유 확인용(폐기할 경우만 이외에는 삭제 가능, true일 때만 폐기)", example = "false")
    private Boolean isDisposal;
}
