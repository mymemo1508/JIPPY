package com.hbhw.jippy.domain.store.repository;

import com.hbhw.jippy.domain.store.entity.StoreCoordinates;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface StoreCoordinatesRepository extends MongoRepository<StoreCoordinates, Integer> {
    Optional<StoreCoordinates> findByStoreId(Integer storeId);
}
