package com.hbhw.jippy.utils.converter;

import com.hbhw.jippy.domain.product.enums.ProductType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.Objects;

@Converter(autoApply = true)
public class ProductTypeConverter implements AttributeConverter<ProductType, Integer> {

    @Override
    public Integer convertToDatabaseColumn(ProductType productType){
        if(!Objects.isNull(productType)){
            return productType.getCode();
        }
        throw new IllegalArgumentException();
    }

    @Override
    public ProductType convertToEntityAttribute(Integer code){
        if(!Objects.isNull(code)){
            return ProductType.ofLegacyCode(code);
        }
        throw new IllegalArgumentException();
    }
}
