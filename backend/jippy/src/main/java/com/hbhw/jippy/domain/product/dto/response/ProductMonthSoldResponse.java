package com.hbhw.jippy.domain.product.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Builder
@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProductMonthSoldResponse {
    private Map<String, List<ProductSoldCountResponse>> productMonthlySold;
}
