package com.hbhw.jippy.domain.product.dto.response;

import lombok.*;

import java.util.List;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SetMenuResponse {
    private Integer setMenuId;
    private String name;
    private Integer price;
    private String image;
    private List<ProductDetailResponse> productDetailResponseList;
}
