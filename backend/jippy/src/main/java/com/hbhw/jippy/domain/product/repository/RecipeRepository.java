package com.hbhw.jippy.domain.product.repository;

import com.hbhw.jippy.domain.product.entity.Recipe;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RecipeRepository extends MongoRepository<Recipe, Long> {

    Optional<Recipe> findByProductId(Long productId);

}
