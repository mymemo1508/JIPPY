package com.hbhw.jippy.domain.product.service;

import com.hbhw.jippy.domain.product.dto.request.SearchRecipeRequest;
import com.hbhw.jippy.domain.product.dto.request.RecipeRequest;
import com.hbhw.jippy.domain.product.entity.Ingredient;
import com.hbhw.jippy.domain.product.entity.Product;
import com.hbhw.jippy.domain.product.entity.Recipe;
import com.hbhw.jippy.domain.product.repository.RecipeCustomRepository;
import com.hbhw.jippy.domain.product.repository.RecipeRepository;
import com.hbhw.jippy.utils.DateTimeUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@RequiredArgsConstructor
@Service
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final RecipeCustomRepository recipeCustomRepository;
    private final ProductService productService;

    public void createRecipe(RecipeRequest recipeRequest) {
        Recipe recipeEntity = Recipe.builder()
                .productId(recipeRequest.getProductId())
                .updatedAt(DateTimeUtils.nowString())
                .ingredient(recipeRequest.getIngredient())
                .build();
        recipeRepository.save(recipeEntity);
    }

    public void deleteRecipe(SearchRecipeRequest searchRecipeRequest) {
        Product productEntity = productService.getProduct(searchRecipeRequest.getStoreId(), searchRecipeRequest.getProductId());
        Recipe recipeEntity = getRecipe(searchRecipeRequest.getProductId());
        recipeRepository.delete(recipeEntity);
    }

    public void modifyRecipe(RecipeRequest recipeRequest) {
        recipeRequest.setUpdatedAt(DateTimeUtils.nowString());
        recipeCustomRepository.updateRecipe(recipeRequest);
    }

    public List<Ingredient> selectIngredient(Integer storeId, Long productId){
        Product productEntity = productService.getProduct(storeId, productId);
        Recipe recipeEntity = getRecipe(productId);
        return recipeEntity.getIngredient();
    }

    public Optional<Recipe> getRecipeOrEmpty(Long productId) {
        return recipeRepository.findByProductId(productId);
    }

    public Recipe getRecipe(Long productId) {
        return recipeRepository.findByProductId(productId)
                .orElseThrow(() -> new NoSuchElementException("레시피가 존재하지 않습니다."));
    }
}
