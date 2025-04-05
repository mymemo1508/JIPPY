package com.hbhw.jippy.domain.storeuser.dto.response.attendance;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class ChangeScheduleInfoResponse {
    List<ChangeScheduleResponse> requestSchedule;
}
