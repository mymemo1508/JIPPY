package com.hbhw.jippy.domain.storeuser.dto.response.staff;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class StaffEarnSalesResponse {
    private Integer staffId;
    private String staffName;
    private Integer earnSales;
}
