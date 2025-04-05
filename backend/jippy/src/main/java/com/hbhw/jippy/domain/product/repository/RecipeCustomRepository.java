package com.hbhw.jippy.domain.product.repository;

import com.hbhw.jippy.domain.product.dto.request.RecipeRequest;
import com.hbhw.jippy.domain.product.entity.Recipe;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Repository;

@RequiredArgsConstructor
@Repository
public class RecipeCustomRepository {

    private final MongoTemplate mongoTemplate;

    public void updateRecipe(RecipeRequest updateRecipe) {
        Query query = new Query(Criteria.where("product_id").is(updateRecipe.getProductId()));
        Recipe beforeRecipe = mongoTemplate.findOne(query, Recipe.class);
        Update update = new Update();

        if (beforeRecipe.getUpdatedAt().equals(updateRecipe.getUpdatedAt())) {
            update.set("updated_at", updateRecipe.getUpdatedAt());
        }
        update.set("ingredient", updateRecipe.getIngredient());
        mongoTemplate.updateFirst(query, update, Recipe.class);
    }
}
