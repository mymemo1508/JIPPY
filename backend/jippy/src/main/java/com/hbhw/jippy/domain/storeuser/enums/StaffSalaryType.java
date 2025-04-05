package com.hbhw.jippy.domain.storeuser.enums;

import lombok.Getter;

import java.util.Objects;

@Getter
public enum StaffSalaryType {
    시급(1),
    월급(2);

    private final Integer code;

    StaffSalaryType(Integer code) {
        this.code = code;
    }

    public static StaffSalaryType ofLegacyCode(Integer code) {
        for (StaffSalaryType type : StaffSalaryType.values()) {
            if (Objects.equals(code, type.getCode())) {
                return type;
            }
        }
        throw new IllegalArgumentException("Invalid staff type code: " + code);
    }
}
