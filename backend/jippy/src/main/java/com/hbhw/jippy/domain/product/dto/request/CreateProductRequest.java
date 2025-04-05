package com.hbhw.jippy.domain.product.dto.request;

import com.hbhw.jippy.domain.product.enums.ProductSize;
import com.hbhw.jippy.domain.product.enums.ProductType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CreateProductRequest {
    private Integer productCategoryId;
    private Integer storeId;
    private String name;
    private Integer price;
    private boolean status;
    private ProductType productType;
    private ProductSize productSize;
}

