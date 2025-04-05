package com.hbhw.jippy.domain.product.dto.request;

import com.hbhw.jippy.domain.product.entity.Ingredient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class RecipeRequest {
    private Long productId;
    private String updatedAt;
    private List<Ingredient> ingredient;
}
