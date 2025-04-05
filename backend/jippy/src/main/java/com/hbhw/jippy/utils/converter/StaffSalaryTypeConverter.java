package com.hbhw.jippy.utils.converter;

import com.hbhw.jippy.domain.storeuser.enums.StaffSalaryType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.Objects;

@Converter(autoApply = true)
public class StaffSalaryTypeConverter implements AttributeConverter<StaffSalaryType, Integer> {
    @Override
    public Integer convertToDatabaseColumn(StaffSalaryType type) {
        if (!Objects.isNull(type)) {
            return type.getCode();
        }
        throw new IllegalArgumentException("StaffSalaryType cannot be null!");
    }

    @Override
    public StaffSalaryType convertToEntityAttribute(Integer code) {
        if (!Objects.isNull(code)) {
            return StaffSalaryType.ofLegacyCode(code);
        }
        throw new IllegalArgumentException("StaffSalaryType code cannot be null!");
    }
}
