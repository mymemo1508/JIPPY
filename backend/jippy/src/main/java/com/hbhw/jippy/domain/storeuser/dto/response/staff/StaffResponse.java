package com.hbhw.jippy.domain.storeuser.dto.response.staff;

import com.hbhw.jippy.domain.storeuser.entity.staff.StoreUserStaff;
import com.hbhw.jippy.domain.storeuser.enums.StaffSalaryType;
import com.hbhw.jippy.domain.user.enums.StaffType;
import lombok.Getter;

@Getter
public class StaffResponse {
    private Integer staffId;
    private String staffName;
    private StaffType staffType;
    private Integer staffSalary;
    private StaffSalaryType staffSalaryType;

    public StaffResponse(StoreUserStaff storeUserStaff) {
        this.staffId = storeUserStaff.getId();
        this.staffName = storeUserStaff.getUserStaff().getName();
        this.staffType = storeUserStaff.getStaffType();
        this.staffSalary = storeUserStaff.getStaffSalary();
        this.staffSalaryType = storeUserStaff.getStaffSalaryType();
    }
}
