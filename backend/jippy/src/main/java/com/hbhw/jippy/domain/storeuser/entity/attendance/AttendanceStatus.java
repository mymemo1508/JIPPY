package com.hbhw.jippy.domain.storeuser.entity.attendance;

import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.index.Indexed;

/**
 * 실시간 출근 현황 확인용 Redis
 */
@Getter
@Builder
@AllArgsConstructor
@RedisHash("attendance")
public class AttendanceStatus {
    @Id
    private Integer id;
    private String staffName;
    @Indexed
    private Integer storeId;
}
