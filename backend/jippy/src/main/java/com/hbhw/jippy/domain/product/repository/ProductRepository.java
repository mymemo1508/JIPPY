package com.hbhw.jippy.domain.product.repository;

import com.hbhw.jippy.domain.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByStoreId(Integer storeId);

    Optional<Product> findByIdAndStoreId(Long id, Integer storeId);

    @Transactional
    void deleteByStoreIdAndId(Integer storeId, Long id);
}
