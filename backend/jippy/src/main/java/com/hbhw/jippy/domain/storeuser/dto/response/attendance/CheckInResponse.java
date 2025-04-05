package com.hbhw.jippy.domain.storeuser.dto.response.attendance;

import com.hbhw.jippy.domain.storeuser.entity.attendance.EmploymentStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CheckInResponse {
    private String checkInTime;
    private Boolean isLate;

    public static CheckInResponse of(EmploymentStatus status) {
        return CheckInResponse.builder()
                .checkInTime(status.getStartDate())
                .isLate(status.getIsLate())
                .build();
    }
}
