package com.hbhw.jippy.domain.payment.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PaymentHistoryListResponse {
    private String UUID;
    private String createdAt;
    private String paymentStatus;
    private String paymentType;
    private Integer totalCost;
}
