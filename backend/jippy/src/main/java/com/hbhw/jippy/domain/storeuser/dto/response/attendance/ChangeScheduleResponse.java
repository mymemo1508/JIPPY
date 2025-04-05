package com.hbhw.jippy.domain.storeuser.dto.response.attendance;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class ChangeScheduleResponse {
    private String uuid;
    private Integer staffId;
    private String staffName;
    private String beforeYear;
    private String beforeCheckIn;
    private String beforeCheckOut;
    private String newYear;
    private String newCheckIn;
    private String newCheckOut;
}
