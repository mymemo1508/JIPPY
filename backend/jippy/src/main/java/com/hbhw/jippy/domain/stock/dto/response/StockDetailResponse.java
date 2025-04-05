package com.hbhw.jippy.domain.stock.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Schema(description = "재고 상세 정보 응답")
@Getter
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class StockDetailResponse {

    @Schema(description = "재고 수량", example = "3")
    private Integer stockCount;

    @Schema(description = "재고별 크기", example = "100")
    private Integer stockUnitSize;

    @Schema(description = "재고 단위", example = "g")
    private String stockUnit;
}
