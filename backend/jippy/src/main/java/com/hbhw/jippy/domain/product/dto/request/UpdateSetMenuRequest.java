package com.hbhw.jippy.domain.product.dto.request;

import lombok.*;

import java.util.List;

@ToString
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSetMenuRequest {
    private Integer setMenuId;
    private Integer storeId;
    private String name;
    private Integer price;
    private String image;
    private List<Long> productIdList;
}
