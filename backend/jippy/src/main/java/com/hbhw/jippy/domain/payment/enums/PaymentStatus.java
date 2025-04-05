package com.hbhw.jippy.domain.payment.enums;

import lombok.Getter;

@Getter
public enum PaymentStatus {
    PURCHASE("구매"),
    CANCEL("취소");

    private final String description;

    PaymentStatus(String description) {
        this.description = description;
    }
}
