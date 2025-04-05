package com.hbhw.jippy.domain.stock.dto.request;

import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.util.List;

@Schema(description = "재고 생성 요청")
@Getter
@Setter
@NoArgsConstructor
public class InventoryItemCreateUpdateRequest {

    @Schema(description = "재고 이름(Update 시 변경하지 않을 경우 생략)", example = "원두")
    private String stockName;

    @ArraySchema(
            schema = @Schema(implementation = StockDetailCreateUpdateRequest.class)
    )
    private List<StockDetailCreateUpdateRequest> stock;
}
