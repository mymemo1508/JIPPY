package com.hbhw.jippy.domain.product.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SearchRecipeRequest {
    private Long productId;
    private Integer storeId;
}
