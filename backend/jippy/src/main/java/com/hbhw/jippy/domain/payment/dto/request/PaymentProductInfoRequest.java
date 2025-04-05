package com.hbhw.jippy.domain.payment.dto.request;

import lombok.Getter;

@Getter
public class PaymentProductInfoRequest {
    private Long productId;
    private Integer quantity;
}
