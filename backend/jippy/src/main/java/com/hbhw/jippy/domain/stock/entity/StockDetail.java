package com.hbhw.jippy.domain.stock.entity;

import lombok.*;
import org.springframework.data.mongodb.core.mapping.Field;

@Getter
@Setter
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class StockDetail {
    @Field("stock_count")
    private Integer stockCount;

    @Field("stock_unit_size")
    private Integer stockUnitSize;

    @Field("stock_unit")
    private String stockUnit;
}
