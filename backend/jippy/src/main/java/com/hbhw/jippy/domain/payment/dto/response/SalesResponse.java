package com.hbhw.jippy.domain.payment.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class SalesResponse {
    private String date;
    private Integer totalSales;
    private Integer orderCount;
}
