package com.hbhw.jippy.domain.storeuser.dto.response.calendar;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

/**
 * 직원의 전체 스케줄 정보
 */
@Getter
@AllArgsConstructor
public class StaffScheduleResponse {
    private final Integer staffId;
    private final String staffName;
    private final List<ScheduleResponse> schedules;
}
