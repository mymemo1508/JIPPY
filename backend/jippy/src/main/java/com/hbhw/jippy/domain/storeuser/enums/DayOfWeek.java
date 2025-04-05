package com.hbhw.jippy.domain.storeuser.enums;

import lombok.Getter;

import java.util.Objects;

@Getter
public enum DayOfWeek {
    월(1),
    화(2),
    수(3),
    목(4),
    금(5),
    토(6),
    일(7);

    private final Integer code;

    DayOfWeek(Integer code) {
        this.code = code;
    }

    public static DayOfWeek ofLegacyCode(Integer code) {
        for (DayOfWeek type : DayOfWeek.values()) {
            if (Objects.equals(code, type.getCode())) {
                return type;
            }
        }
        throw new IllegalArgumentException("Invalid staff type code: " + code);
    }
}
