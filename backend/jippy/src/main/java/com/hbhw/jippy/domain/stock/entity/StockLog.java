package com.hbhw.jippy.domain.stock.entity;

import jakarta.persistence.Id;
import lombok.*;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "stock_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockLog {

    @Id
    @Field("store_id")
    private Integer storeId;

    @Field("stock_id")
    private ObjectId stockId;

    @Field("stock_name")
    private String stockName;

    @Field("stock_unit_size")
    private Integer stockUnitSize;

    @Field("change_type")
    private ChangeType changeType;

    @Field("change_reason")
    private ChangeReason changeReason;

    @Field("before_stock_count")
    private Integer beforeStockCount;

    @Field("after_stock_count")
    private Integer afterStockCount;

    @Field("created_at")
    private String createdAt;
}
