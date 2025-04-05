package com.hbhw.jippy.domain.store.repository;

import com.hbhw.jippy.domain.store.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StoreRepository extends JpaRepository<Store, Integer> {
    Optional<List<Store>> findByUserOwnerId(Integer ownerId);
}
