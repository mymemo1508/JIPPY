package com.hbhw.jippy.domain.product.repository;

import com.hbhw.jippy.domain.product.entity.SetMenu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SetMenuRepository extends JpaRepository<SetMenu, Integer> {

    Optional<SetMenu> findByIdAndStoreId(Integer id, Integer storeId);

    List<SetMenu> findByStoreId(Integer storeId);

}
