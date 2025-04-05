package com.hbhw.jippy.domain.stock.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LowStockInfoResponse {
    private String stockName;
    private Integer soldPercentage;
    private Integer remainingStock;
}
