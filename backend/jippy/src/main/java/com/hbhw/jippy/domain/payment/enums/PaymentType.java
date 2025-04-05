package com.hbhw.jippy.domain.payment.enums;

import lombok.Getter;

@Getter
public enum PaymentType {
    QRCODE("QR코드"),
    CASH("현금");

    private final String description;

    PaymentType(String description) {
        this.description = description;
    }
}
