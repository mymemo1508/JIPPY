package com.hbhw.jippy.domain.stock.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class StockStatusResponse {
    private Integer storeId;
    private Boolean hasLowStock;
    private List<LowStockInfoResponse> lowStockList;
}
