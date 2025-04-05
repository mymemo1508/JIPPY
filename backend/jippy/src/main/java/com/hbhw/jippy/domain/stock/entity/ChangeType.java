package com.hbhw.jippy.domain.stock.entity;

import lombok.Getter;

@Getter
public enum ChangeType {
    INCREASE("증가"),
    DECREASE("감소"),
    DISPOSAL("폐기");

    private final String description;

    ChangeType(String description) {
        this.description = description;
    }
}