package com.hbhw.jippy.domain.stock.repository;

import com.hbhw.jippy.domain.stock.entity.Stock;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StockRepository extends MongoRepository<Stock, Integer> {
    Optional<Stock> findByStoreId(Integer storeId);
}
