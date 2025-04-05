package com.hbhw.jippy.utils.converter;

import com.hbhw.jippy.domain.storeuser.enums.DayOfWeek;
import jakarta.persistence.AttributeConverter;

import java.util.Objects;

public class DayOfWeekConverter implements AttributeConverter<DayOfWeek, Integer> {
    @Override
    public Integer convertToDatabaseColumn(DayOfWeek dayOfWeek){
        if(!Objects.isNull(dayOfWeek)){
            return dayOfWeek.getCode();
        }
        throw new IllegalArgumentException();
    }

    @Override
    public DayOfWeek convertToEntityAttribute(Integer code){
        if(!Objects.isNull(code)){
            return DayOfWeek.ofLegacyCode(code);
        }
        throw new IllegalArgumentException();
    }
}
