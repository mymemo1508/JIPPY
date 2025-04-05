package com.hbhw.jippy.domain.notice.repository;

import com.hbhw.jippy.domain.notice.entity.Notice;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface NoticeRepository extends JpaRepository<Notice, Long> {

    @Query("SELECT n FROM Notice n " +
            "WHERE n.storeId.id = :storeId " +
              "AND (:startDate IS NULL OR n.createdAt >= :startDate)" +
              "AND (:endDate IS NULL OR n.createdAt <= :endDate)")
    Page<Notice> findByStoreIdAndSearchConditions(
            @Param("storeId") Integer storeId,
            @Param("startDate") String startDate,
            @Param("endDate") String endDate,
            Pageable pageable
    );
}
