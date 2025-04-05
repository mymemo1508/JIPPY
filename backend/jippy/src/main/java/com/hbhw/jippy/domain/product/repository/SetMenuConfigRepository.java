package com.hbhw.jippy.domain.product.repository;

import com.hbhw.jippy.domain.product.entity.SetMenuConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SetMenuConfigRepository extends JpaRepository<SetMenuConfig, Integer> {
    List<SetMenuConfig> findBySetMenuId(Integer setMenuId);
    Optional<SetMenuConfig> findBySetMenuIdAndProductId(Integer setMenuId, Long productId);
}
