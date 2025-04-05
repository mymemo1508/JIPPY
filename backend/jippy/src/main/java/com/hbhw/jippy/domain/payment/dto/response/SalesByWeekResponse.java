package com.hbhw.jippy.domain.payment.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Builder
@Getter
@Setter
public class SalesByWeekResponse {
    private List<SalesResponse> salesByWeek;
}
