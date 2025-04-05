package com.hbhw.jippy.domain.stock.entity;

import lombok.*;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class InventoryItem {
    @Field("stock_name")
    private String stockName;

    @Field("stock_total_value")
    private Integer stockTotalValue;

    @Field("updated_at")
    private String updatedAt;

    private List<StockDetail> stock = new ArrayList<>();
}
