package com.hbhw.jippy.domain.storeuser.dto.request.calendar;

import com.hbhw.jippy.domain.storeuser.enums.DayOfWeek;
import lombok.*;

@Getter
@Builder
public class DayScheduleRequest {
    private DayOfWeek dayOfWeek;
    private String startTime;
    private String endTime;
}
