package com.hbhw.jippy.domain.product.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.ToString;

import java.util.List;

@Getter
@AllArgsConstructor
public class CreateSetMenuRequest {
    private Integer storeId;
    private String name;
    private Integer price;
    private String image;
    private List<Long> productList;
}
