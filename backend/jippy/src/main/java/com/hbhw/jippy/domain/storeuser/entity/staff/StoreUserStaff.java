package com.hbhw.jippy.domain.storeuser.entity.staff;

import com.hbhw.jippy.domain.store.entity.Store;
import com.hbhw.jippy.domain.storeuser.enums.StaffSalaryType;
import com.hbhw.jippy.domain.user.entity.UserStaff;
import com.hbhw.jippy.domain.user.enums.StaffType;
import com.hbhw.jippy.utils.converter.StaffSalaryTypeConverter;
import com.hbhw.jippy.utils.converter.StaffTypeConverter;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "store_user_staff")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StoreUserStaff {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_staff_id", nullable = false)
    private UserStaff userStaff;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Convert(converter = StaffTypeConverter.class)
    @Column(name = "staff_type", nullable = false)
    private StaffType staffType;

    @Column(name = "staff_salary", nullable = false)
    private Integer staffSalary;

    @Convert(converter = StaffSalaryTypeConverter.class)
    @Column(name = "staff_salary_type", nullable = false)
    private StaffSalaryType staffSalaryType;

    @Builder
    public StoreUserStaff(UserStaff userStaff, Store store, StaffType staffType, Integer staffSalary, StaffSalaryType staffSalaryType) {
        this.userStaff = userStaff;
        this.store = store;
        this.staffType = staffType;
        this.staffSalary = staffSalary;
        this.staffSalaryType = staffSalaryType;
    }

    public void updateStaffType(StaffType staffType) {
        this.staffType = staffType;
    }

    public void updateStaffSalary(Integer staffSalary) {
        this.staffSalary = staffSalary;
    }

    public void updateStaffSalaryType(StaffSalaryType staffSalaryType) {
        this.staffSalaryType = staffSalaryType;
    }
}
