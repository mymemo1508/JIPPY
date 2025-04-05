package com.hbhw.jippy.domain.storeuser.dto.request.attendance;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChangeScheduleRequest {
    private String beforeYear;
    private String beforeCheckIn;
    private String beforeCheckOut;
    private String newYear;
    private String newCheckIn;
    private String newCheckOut;
}
