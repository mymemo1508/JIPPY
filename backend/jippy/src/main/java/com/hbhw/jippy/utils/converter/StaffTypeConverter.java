package com.hbhw.jippy.utils.converter;

import com.hbhw.jippy.domain.user.enums.StaffType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.Objects;

@Converter(autoApply = true)
public class StaffTypeConverter implements AttributeConverter<StaffType, Integer> {
    @Override
    public Integer convertToDatabaseColumn(StaffType type) {
        if (!Objects.isNull(type)) {
            return type.getCode();
        }
        throw new IllegalArgumentException("StaffType cannot be null!");
    }

    @Override
    public StaffType convertToEntityAttribute(Integer code) {
        if (!Objects.isNull(code)) {
            return StaffType.ofLegacyCode(code);
        }
        throw new IllegalArgumentException("StaffType code cannot be null!");
    }
}
