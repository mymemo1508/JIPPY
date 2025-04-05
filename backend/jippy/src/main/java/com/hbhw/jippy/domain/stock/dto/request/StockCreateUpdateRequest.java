package com.hbhw.jippy.domain.stock.dto.request;

import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Schema(description = "재고 생성/수정 요청 DTO")
@Getter
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class StockCreateUpdateRequest {

    @ArraySchema(
            schema = @Schema(implementation = InventoryItemCreateUpdateRequest.class)
    )
    private List<InventoryItemCreateUpdateRequest> inventory;
}
