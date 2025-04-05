package com.hbhw.jippy.domain.payment.dto.request;

import com.hbhw.jippy.domain.cash.dto.request.CashRequest;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CancelCashPaymentRequest {
    private PaymentUUIDRequest paymentUUIDRequest;
    private CashRequest cashRequest;
}
