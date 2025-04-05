package com.hbhw.jippy.domain.storeuser.repository.attendance;

import com.hbhw.jippy.domain.storeuser.entity.attendance.EmploymentStatus;
import com.hbhw.jippy.domain.storeuser.entity.staff.StoreUserStaff;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface EmploymentStatusRepository extends JpaRepository<EmploymentStatus, Long> {
    @Query("SELECT e FROM EmploymentStatus e " +
            "WHERE e.storeUserStaff.id = :storeUserStaffId " +
            "AND e.startDate LIKE :today% " +
            "AND e.endDate = '9999-12-31 23:59:59' " +
            "ORDER BY e.id DESC")
    Optional<List<EmploymentStatus>> findTodayAttendance(@Param("storeUserStaffId") Integer storeUserStaffId,
                                                   @Param("today") String today);

    List<EmploymentStatus> findByStoreUserStaffAndStartDateBetween(StoreUserStaff staff, String startDate, String endDate);

    List<EmploymentStatus> findByStoreUserStaff(StoreUserStaff staff);

    @Query("SELECT e.storeUserStaff.id as staffId, SUM(e.totalWorkTime) as totalMinutes " +
            "FROM EmploymentStatus e " +
            "WHERE e.store.id = :storeId " +
            "AND e.storeUserStaff.id IN :staffIds " +
            "AND e.startDate BETWEEN :startDate AND :endDate " +
            "GROUP BY e.storeUserStaff.id")
    List<Map<Integer, Integer>> findTotalWorkTimesByStoreIdAndStaffIdsAndDateBetween(
            @Param("storeId") Integer storeId,
            @Param("staffIds") List<Integer> staffIds,
            @Param("startDate") String startDate,
            @Param("endDate") String endDate
    );

    List<EmploymentStatus> findByStoreId(Integer storeId);
}
