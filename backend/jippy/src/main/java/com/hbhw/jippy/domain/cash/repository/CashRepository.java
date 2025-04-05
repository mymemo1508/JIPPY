package com.hbhw.jippy.domain.cash.repository;

import com.hbhw.jippy.domain.cash.entity.Cash;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CashRepository extends JpaRepository<Cash, Integer> {
    boolean existsByStoreId(Integer storeId);
    Optional<Cash> findByStoreId(Integer storeId);
}
