package com.hbhw.jippy.domain.stock.dto.response;

import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Schema(description = "재고 인벤토리 응답")
@Getter
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class InventoryItemResponse {

    @Schema(description = "재고 이름", example = "원두")
    private String stockName;

    @Schema(description = "재고 총량", example = "300")
    private Integer stockTotalValue;

    @Schema(description = "총량 단위", example = "g")
    private String totalUnit;

    @Schema(description = "업데이트 시간", example = "2025-01-31 15:40:00")
    private String updatedAt;

    @ArraySchema(
            schema = @Schema(implementation = StockDetailResponse.class)
    )
    private List<StockDetailResponse> stock;
}
