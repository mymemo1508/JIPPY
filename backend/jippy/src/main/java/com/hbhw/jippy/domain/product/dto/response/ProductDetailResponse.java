package com.hbhw.jippy.domain.product.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.hbhw.jippy.domain.product.enums.ProductSize;
import com.hbhw.jippy.domain.product.enums.ProductType;
import lombok.*;

@Builder
@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
@AllArgsConstructor
@NoArgsConstructor
public class ProductDetailResponse {
    private Long productId;
    private Integer productCategoryId;
    private Integer storeId;
    private String name;
    private Integer price;
    private boolean status;
    private Integer totalSold;
    private String image;
    private ProductType productType;
    private ProductSize productSize;
}
