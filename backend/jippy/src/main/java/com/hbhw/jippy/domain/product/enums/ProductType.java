package com.hbhw.jippy.domain.product.enums;

import lombok.Getter;

import java.util.Objects;

@Getter
public enum ProductType {
    ICE(1),
    HOT(2),
    EXTRA(3);

    private Integer code;

    ProductType(Integer code) {
        this.code = code;
    }

    public static ProductType ofLegacyCode(Integer code) {
        for (ProductType type : ProductType.values()) {
            if (Objects.equals(code, type.getCode())) {
                return type;
            }
        }
        throw new IllegalArgumentException("Error!");
    }

}
