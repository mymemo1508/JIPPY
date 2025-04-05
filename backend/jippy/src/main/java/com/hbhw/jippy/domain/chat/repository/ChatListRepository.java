package com.hbhw.jippy.domain.chat.repository;

import com.hbhw.jippy.domain.storeuser.entity.staff.StoreUserStaff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChatListRepository extends JpaRepository<StoreUserStaff, Integer> {
    List<StoreUserStaff> findByUserStaffId(Integer userStaffId);
}
