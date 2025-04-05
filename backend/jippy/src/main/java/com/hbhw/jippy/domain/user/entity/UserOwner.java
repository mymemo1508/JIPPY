package com.hbhw.jippy.domain.user.entity;

import com.hbhw.jippy.utils.converter.StaffTypeConverter;
import com.hbhw.jippy.domain.user.enums.StaffType;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "user_owner")
@Getter
@AllArgsConstructor
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserOwner extends BaseUser {
    @Convert(converter = StaffTypeConverter.class)
    @Column(name = "staff_type", nullable = false)
    private StaffType staffType;

//    @Builder
//    public UserOwner(String email, String password, String name, String age, StaffType staffType, String fcmToken) {
//        super(email, password, name, age, fcmToken);
//        this.staffType = staffType;
//    }
}
