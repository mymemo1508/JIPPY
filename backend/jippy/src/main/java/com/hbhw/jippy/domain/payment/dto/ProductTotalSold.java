package com.hbhw.jippy.domain.payment.dto;

import lombok.Getter;
import lombok.ToString;

@ToString
@Getter
public class ProductTotalSold {
    private Long productId;
    private Integer totalQuantity;
}
