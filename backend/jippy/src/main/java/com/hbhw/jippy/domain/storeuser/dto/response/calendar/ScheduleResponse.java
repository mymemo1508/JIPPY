package com.hbhw.jippy.domain.storeuser.dto.response.calendar;

import com.hbhw.jippy.domain.storeuser.entity.calendar.Calendar;
import com.hbhw.jippy.domain.storeuser.enums.DayOfWeek;
import lombok.Getter;

/**
 * 개별 스케줄 정보
 */
@Getter
public class ScheduleResponse {
    private final Integer calendarId;
    private final DayOfWeek dayOfWeek;
    private final String startTime;
    private final String endTime;

    public ScheduleResponse(Calendar calendar) {
        this.calendarId = calendar.getId();
        this.dayOfWeek = calendar.getDayOfWeek();
        this.startTime = calendar.getStartTime();
        this.endTime = calendar.getEndTime();
    }
}
