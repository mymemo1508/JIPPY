package com.hbhw.jippy.utils.converter;

import com.hbhw.jippy.domain.product.enums.ProductSize;
import jakarta.persistence.AttributeConverter;

import java.util.Objects;

public class ProductSizeConverter implements AttributeConverter<ProductSize, Integer> {

    @Override
    public Integer convertToDatabaseColumn(ProductSize productSize) {
        if(!Objects.isNull(productSize)){
            return productSize.getCode();
        }
        throw new IllegalArgumentException();
    }

    @Override
    public ProductSize convertToEntityAttribute(Integer code) {
        if(!Objects.isNull(code)){
            return ProductSize.ofLegacyCode(code);
        }
        throw new IllegalArgumentException();
    }
}
