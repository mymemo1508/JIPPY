package com.hbhw.jippy.domain.product.entity;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ingredient {
    private String name;
    private Integer amount;
    private String unit;
}
