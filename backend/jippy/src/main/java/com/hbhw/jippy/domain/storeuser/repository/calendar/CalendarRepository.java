package com.hbhw.jippy.domain.storeuser.repository.calendar;

import com.hbhw.jippy.domain.storeuser.entity.calendar.Calendar;
import com.hbhw.jippy.domain.storeuser.entity.staff.StoreUserStaff;
import com.hbhw.jippy.domain.storeuser.enums.DayOfWeek;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CalendarRepository extends JpaRepository<Calendar, Integer> {
    @Query("SELECT c FROM Calendar c " +
            "JOIN FETCH c.storeUserStaff sus " +
            "JOIN FETCH sus.userStaff " +
            "WHERE sus.store.id = :storeId")
    List<Calendar> findAllByStoreId(Integer storeId);

    List<Calendar> findByStoreUserStaff(StoreUserStaff storeUserStaff);

    Optional<Calendar> findByStoreUserStaffAndDayOfWeek(StoreUserStaff staff, DayOfWeek dayOfWeek);
}
