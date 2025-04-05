package com.hbhw.jippy.domain.product.dto.response;

import com.hbhw.jippy.domain.product.enums.ProductSize;
import com.hbhw.jippy.domain.product.enums.ProductType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
@AllArgsConstructor
public class ProductListResponse {
    private Long id;
    private Integer storeId;
    private Integer productCategoryId;
    private String name;
    private Integer price;
    private boolean status;
    private ProductType productType;
    private ProductSize productSize;
    private String image;
}
