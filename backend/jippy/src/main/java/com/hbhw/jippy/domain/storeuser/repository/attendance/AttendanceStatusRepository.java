package com.hbhw.jippy.domain.storeuser.repository.attendance;

import com.hbhw.jippy.domain.storeuser.entity.attendance.AttendanceStatus;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttendanceStatusRepository extends CrudRepository<AttendanceStatus, Integer> {
    List<AttendanceStatus> findByStoreId(Integer storeId);
}
