package com.hbhw.jippy.domain.product.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
@AllArgsConstructor
public class CategoryListResponse {
    private Integer id;
    private String categoryName;
}
