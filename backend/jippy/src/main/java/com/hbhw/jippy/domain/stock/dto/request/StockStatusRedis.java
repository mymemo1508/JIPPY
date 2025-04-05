package com.hbhw.jippy.domain.stock.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockStatusRedis {
    private Integer initialStock; // 원래 재고 총량
    private Integer soldStock; // 하루 판매 재고 수량? 50g
    private Integer currentStock; // 현재 남은 재고 수량
    private Integer soldPercentage; // 퍼센트 계산한 거
    private String lastUpdated;
    private Boolean isDessert; // 개수 3개 이하면 제공
    private Boolean isLowStock; // 70%이상이거나 3개 이하면 true
}
