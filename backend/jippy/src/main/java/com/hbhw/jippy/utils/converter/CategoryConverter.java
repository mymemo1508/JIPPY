package com.hbhw.jippy.utils.converter;

import com.hbhw.jippy.domain.feedback.enums.Category;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class CategoryConverter implements AttributeConverter<Category, String> {

    @Override
    public String convertToDatabaseColumn(Category attribute) {
        if (attribute == null) {
            return null;
        }
        // enum 내부의 value("1", "2", "3")를 DB에 저장
        return attribute.getValue();
    }

    @Override
    public Category convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        // DB에 저장된 값("1", "2", "3")을 enum으로 매핑
        return Category.fromValue(dbData);
    }
}
