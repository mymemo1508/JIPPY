package com.hbhw.jippy.domain.payment.dto.request;

import lombok.Getter;

@Getter
public class PaymentUUIDRequest {
    private Integer storeId;
    private String paymentUUID;
}
