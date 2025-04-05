package com.hbhw.jippy.domain.stock.dto.response;

import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Schema(description = "재고 응답 DTO")
@Getter
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class StockResponse {

    @Schema(description = "매장 ID", example = "1")
    private Integer storeId;

    @ArraySchema(
            schema = @Schema(implementation = InventoryItemResponse.class)
    )
    private List<InventoryItemResponse> inventory;
}
