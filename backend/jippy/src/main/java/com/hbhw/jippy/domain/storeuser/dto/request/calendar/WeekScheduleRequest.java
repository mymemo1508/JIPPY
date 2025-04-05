package com.hbhw.jippy.domain.storeuser.dto.request.calendar;

import lombok.*;

import java.util.List;

@Getter
@Builder
public class WeekScheduleRequest {
    private List<DayScheduleRequest> schedules;
}
