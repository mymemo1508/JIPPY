package com.hbhw.jippy.domain.user.enums;

import lombok.Getter;

import java.util.Objects;

/**
 * 권한 관리용
 */
@Getter
public enum StaffType {
    OWNER(1, "ROLE_OWNER"),
    STAFF(2, "ROLE_STAFF"),
    MANAGER(3, "ROLE_MANAGER");

    private final Integer code;
    private final String role;

    StaffType(Integer code, String role) {
        this.code = code;
        this.role = role;
    }

    public static StaffType ofLegacyCode(Integer code) {
        for (StaffType type : StaffType.values()) {
            if (Objects.equals(code, type.getCode())) {
                return type;
            }
        }
        throw new IllegalArgumentException("Invalid staff type code: " + code);
    }
}
