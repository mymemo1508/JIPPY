package com.hbhw.jippy.domain.user.repository;

import com.hbhw.jippy.domain.user.entity.UserStaff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserStaffRepository extends JpaRepository<UserStaff, Integer> {
    boolean existsByEmail(String email);
    Optional<UserStaff> findByEmail(String email);
}
