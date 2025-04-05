package com.hbhw.jippy.domain.stock.repository;

import com.hbhw.jippy.domain.stock.entity.StockLog;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface StockLogRepository extends MongoRepository<StockLog, Integer> {
    List<StockLog> findStockLogsByStoreId(Integer stockId);
    List<StockLog> findStockLogsByStockId(Object stockId);
    List<StockLog> findStockLogsByStoreIdAndCreatedAtBetween(Integer storeId, String startDate, String endDate);
}
