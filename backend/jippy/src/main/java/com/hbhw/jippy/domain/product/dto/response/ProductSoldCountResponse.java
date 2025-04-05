package com.hbhw.jippy.domain.product.dto.response;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductSoldCountResponse {
    private Long productId;
    private String productName;
    private Integer soldCount;
}
