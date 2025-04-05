package com.hbhw.jippy.domain.stock.dto.request;

import com.hbhw.jippy.domain.stock.entity.ChangeReason;
import com.hbhw.jippy.domain.stock.entity.ChangeType;
import com.hbhw.jippy.domain.stock.entity.StockLog;
import com.hbhw.jippy.utils.DateTimeUtils;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StockLogCreateRequest {
    private Integer storeId;
    private ObjectId stockId;
    private String stockName;
    private Integer stockUnitSize;
    private ChangeType changeType;
    private ChangeReason changeReason;
    private Integer beforeStockCount;
    private Integer afterStockCount;

    @Builder
    public StockLogCreateRequest(Integer storeId, ObjectId stockId, String stockName, Integer stockUnitSize,
                             ChangeType changeType, ChangeReason changeReason,
                             Integer beforeStockCount, Integer afterStockCount) {
        this.storeId = storeId;
        this.stockId = stockId;
        this.stockName = stockName;
        this.stockUnitSize = stockUnitSize;
        this.changeType = changeType;
        this.changeReason = changeReason;
        this.beforeStockCount = beforeStockCount;
        this.afterStockCount = afterStockCount;
    }

    public StockLog toEntity() {
        return StockLog.builder()
                .storeId(storeId)
                .stockId(stockId)
                .stockName(stockName)
                .stockUnitSize(stockUnitSize)
                .changeType(changeType)
                .changeReason(changeReason)
                .beforeStockCount(beforeStockCount)
                .afterStockCount(afterStockCount)
                .createdAt(DateTimeUtils.nowString())
                .build();
    }
}
