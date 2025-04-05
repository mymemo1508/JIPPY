package com.hbhw.jippy.domain.task.repository;

import com.hbhw.jippy.domain.task.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    /**
     * 매장별 할 일 전체 조회
     */
    List<Task> findByStoreId(Integer storeId);
}
