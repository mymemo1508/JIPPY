package com.hbhw.jippy.domain.payment.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ConfirmQrCodePaymentRequest extends ConfirmPaymentRequest {
    private String orderId;
    private String paymentKey;
    private Long amount;
}
