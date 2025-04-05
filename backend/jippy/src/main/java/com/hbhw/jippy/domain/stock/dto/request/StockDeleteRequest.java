package com.hbhw.jippy.domain.stock.dto.request;

import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Schema(description = "재고 삭제 요청 DTO")
@Getter
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class StockDeleteRequest {

    @ArraySchema(
            schema = @Schema(implementation = InventoryItemDeleteRequest.class)
    )
    private List<InventoryItemDeleteRequest> inventory;
}
