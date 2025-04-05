package com.hbhw.jippy.domain.payment.dto.request;

import com.hbhw.jippy.domain.cash.dto.request.CashRequest;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@ToString
@Getter
@Setter
public class ConfirmCashPaymentRequest extends ConfirmPaymentRequest{
    private CashRequest cashRequest;
}