package com.hbhw.jippy.domain.storeuser.repository.staff;

import com.hbhw.jippy.domain.storeuser.entity.staff.StoreUserStaff;
import com.hbhw.jippy.domain.storeuser.enums.StaffSalaryType;
import com.hbhw.jippy.domain.user.entity.UserStaff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Optional;

@Repository
public interface StoreStaffRepository extends JpaRepository<StoreUserStaff, Integer> {
    @Query("SELECT ss FROM StoreUserStaff ss JOIN FETCH ss.userStaff WHERE ss.store.id = :storeId")
    List<StoreUserStaff> findAllByStoreIdWithUserStaff(@PathVariable Integer storeId);

    Optional<List<StoreUserStaff>> findAllByUserStaffId(Integer userStaffId);

    Optional<StoreUserStaff> findByUserStaffId(Integer userStaffId);

    Optional<StoreUserStaff> findByStoreIdAndUserStaffId(Integer storeId, Integer userStaffId);

    Optional<List<StoreUserStaff>> findByStoreId(Integer storeId);

    List<StoreUserStaff> findByStoreIdAndStaffSalaryType(Integer storeId, StaffSalaryType staffSalaryType);
}