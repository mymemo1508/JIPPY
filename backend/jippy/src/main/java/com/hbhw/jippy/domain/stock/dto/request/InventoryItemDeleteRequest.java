package com.hbhw.jippy.domain.stock.dto.request;

import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Schema(description = "재고 인벤토리 수정/삭제 요청")
@Getter
@Setter
@NoArgsConstructor
public class InventoryItemDeleteRequest {

    @ArraySchema(
            schema = @Schema(implementation = StockDetailDeleteRequest.class),
            arraySchema = @Schema(description = "수정/삭제할 재고 상세 목록")
    )
    private List<StockDetailDeleteRequest> stock;
}
