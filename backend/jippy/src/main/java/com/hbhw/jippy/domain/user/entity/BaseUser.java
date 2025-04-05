package com.hbhw.jippy.domain.user.entity;

import com.hbhw.jippy.utils.DateTimeUtils;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@MappedSuperclass
@Getter
@ToString
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public abstract class BaseUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(nullable = false, length = 80)
    private String password;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, length = 15)
    private String age;

    @Column(name = "created_at", nullable = false, length = 20)
    private String createdAt;

    @Column(name = "fcm_token", nullable = true, length = 256)
    private String fcmToken;

    protected BaseUser(String email, String password, String name, String age, String fcmToken) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.age = age;
        this.createdAt = DateTimeUtils.nowString();
        this.fcmToken = fcmToken;
    }

    public void updateInfo(String name, String age) {
        if (name != null) {
            this.name = name;
        }
        if (age != null) {
            this.age = age;
        }
    }

    public void updatePassword(String newPassword) {
        this.password = newPassword;
    }

    // 만약 사용자가 초기에 알림 허용을 거부하고 나중에 허용 승인 할 경우
    public void updateFcmToken(String fcmToken) {this.fcmToken = fcmToken;}
}
