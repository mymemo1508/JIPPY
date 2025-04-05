package com.hbhw.jippy.domain.user.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_staff")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserStaff extends BaseUser {
    @Builder
    public UserStaff(String email, String password, String name, String age, String fcmToken) {
        super(email, password, name, age, fcmToken);
    }
}
