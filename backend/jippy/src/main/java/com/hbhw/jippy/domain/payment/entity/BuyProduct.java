package com.hbhw.jippy.domain.payment.entity;

import lombok.*;
import org.springframework.data.mongodb.core.mapping.Field;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BuyProduct {
    @Field("product_id")
    private Long productId;

    @Field("product_name")
    private String productName;

    @Field("product_category_id")
    private Integer productCategoryId;

    @Field("product_quantity")
    private Integer productQuantity;

    @Field("price")
    private Integer price;
}
