package com.hbhw.jippy.domain.payment.dto.request;

import com.hbhw.jippy.domain.payment.enums.PaymentType;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
public class ConfirmPaymentRequest {
    private Integer storeId;
    private Integer totalCost;
    private PaymentType paymentType;
    private List<PaymentProductInfoRequest> productList;
}
