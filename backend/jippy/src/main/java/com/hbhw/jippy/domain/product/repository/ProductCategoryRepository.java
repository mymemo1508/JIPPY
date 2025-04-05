package com.hbhw.jippy.domain.product.repository;

import com.hbhw.jippy.domain.product.entity.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductCategoryRepository extends JpaRepository<ProductCategory, Integer> {

    List<ProductCategory> findByStoreId(Integer storeId);

    Optional<ProductCategory> findByStoreIdAndId(Integer storeId, Integer categoryId);
}
