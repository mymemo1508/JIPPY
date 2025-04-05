package com.hbhw.jippy.domain.stock.entity;

import lombok.Getter;

@Getter
public enum ChangeReason {
    PURCHASE("구매"),
    SALE("판매"),
    DISPOSAL("폐기"),
    REFUND("환불"),
    MODIFICATION("수정");

    private final String description;

    ChangeReason(String description) {
        this.description = description;
    }
}
