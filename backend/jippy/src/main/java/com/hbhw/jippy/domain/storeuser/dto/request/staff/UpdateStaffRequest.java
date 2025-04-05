package com.hbhw.jippy.domain.storeuser.dto.request.staff;

import com.hbhw.jippy.domain.storeuser.enums.StaffSalaryType;
import com.hbhw.jippy.domain.user.enums.StaffType;
import lombok.Getter;

@Getter
public class UpdateStaffRequest {
    private StaffType staffType;
    private Integer staffSalary;
    private StaffSalaryType staffSalaryType;
}
