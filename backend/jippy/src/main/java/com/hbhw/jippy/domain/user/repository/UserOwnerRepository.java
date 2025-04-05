package com.hbhw.jippy.domain.user.repository;

import com.hbhw.jippy.domain.user.entity.UserOwner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserOwnerRepository extends JpaRepository<UserOwner, Integer> {
    boolean existsByEmail(String email);
    Optional<UserOwner> findByEmail(String email);

    @Query("SELECT s.userOwner FROM Store s WHERE s.id = :storeId")
    Optional<UserOwner> findUserOwnerByStoreId(int storeId);

}
