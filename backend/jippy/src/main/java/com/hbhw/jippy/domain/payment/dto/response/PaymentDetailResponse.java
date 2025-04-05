package com.hbhw.jippy.domain.payment.dto.response;

import com.hbhw.jippy.domain.payment.entity.BuyProduct;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class PaymentDetailResponse {
    private String UUID;
    private Integer totalCost;
    private String createdAt;
    private String paymentType;
    private String paymentStatus;
    private List<BuyProduct> buyProduct;
}
