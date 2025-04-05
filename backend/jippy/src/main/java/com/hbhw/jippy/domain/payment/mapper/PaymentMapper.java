package com.hbhw.jippy.domain.payment.mapper;

import com.hbhw.jippy.domain.payment.dto.response.PaymentHistoryListResponse;
import com.hbhw.jippy.domain.payment.entity.PaymentHistory;
import org.springframework.stereotype.Component;

@Component
public class PaymentMapper {

    public static PaymentHistoryListResponse convertPaymentHistoryListResponse(PaymentHistory paymentHistory) {
        return PaymentHistoryListResponse.builder()
                .paymentType(paymentHistory.getPaymentType())
                .paymentStatus(paymentHistory.getPaymentStatus())
                .UUID(paymentHistory.getUUID())
                .createdAt(paymentHistory.getUpdatedAt())
                .totalCost(paymentHistory.getTotalCost())
                .build();
    }
}
