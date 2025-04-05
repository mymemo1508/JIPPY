package com.hbhw.jippy.domain.storeuser.repository.attendance;

import com.hbhw.jippy.domain.storeuser.entity.attendance.ChangeSchedule;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceMongoRepository  extends MongoRepository<ChangeSchedule, Integer> {

    @Query("{ 'store_id': ?0, 'staff_id': ?1, 'accept_status': ?2 }")
    Optional<List<ChangeSchedule>> getStaffChangeSchedule(Integer storeId, Integer staffId, boolean status);

    @Query(value = "{ 'UUID': ?0 }", delete = true)
    void deleteRequestSchedule(String uuid);
}
