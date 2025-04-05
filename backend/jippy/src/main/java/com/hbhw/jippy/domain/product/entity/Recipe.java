package com.hbhw.jippy.domain.product.entity;

import jakarta.persistence.Id;
import lombok.*;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

@Document(collection = "recipe")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Recipe {
    @Id
    private String id;

    @Indexed(unique = true)
    @Field("product_id")
    private Long productId;

    @Field("updated_at")
    private String updatedAt;

    @Field("ingredient")
    private List<Ingredient> ingredient;
}
