package com.hbhw.jippy.domain.product.enums;

import lombok.Getter;

import java.util.Objects;

@Getter
public enum ProductSize {
    S(1),
    M(2),
    L(3),
    F(4);

    private Integer code;

    ProductSize(Integer code) {
        this.code = code;
    }

    public static ProductSize ofLegacyCode(Integer code) {
        for (ProductSize stat : ProductSize.values()) {
            if (Objects.equals(code, stat.getCode())) {
                return stat;
            }
        }
        throw new IllegalArgumentException("Error!");
    }

}
