package com.hbhw.jippy.domain.product.controller;

import com.hbhw.jippy.domain.product.dto.request.SearchRecipeRequest;
import com.hbhw.jippy.domain.product.dto.request.RecipeRequest;
import com.hbhw.jippy.domain.product.entity.Ingredient;
import com.hbhw.jippy.domain.product.service.RecipeService;
import com.hbhw.jippy.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Recipe", description = "레시피 관리 API")
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/recipe")
public class RecipeController {

    private final RecipeService recipeService;

    @Operation(summary = "레시피 등록(테스트)", description = "상품의 레시피를 등록합니다")
    @PostMapping("/create")
    public ApiResponse<?> createRecipe(@RequestBody RecipeRequest recipeRequest) {
        // 테스트 용, 기능 완성시 삭제할 예정입니다
        recipeService.createRecipe(recipeRequest);
        return ApiResponse.success(HttpStatus.CREATED);
    }

    @Operation(summary = "레시피 삭제", description = "상품의 레시피를 삭제합니다")
    @DeleteMapping("/delete")
    public ApiResponse<?> deleteRecipe(@RequestBody SearchRecipeRequest searchRecipeRequest) {
        recipeService.deleteRecipe(searchRecipeRequest);
        return ApiResponse.success(HttpStatus.OK);
    }

    @Operation(summary = "레시피 수정", description = "상품의 레시피를 수정합니다")
    @PutMapping("/update")
    public ApiResponse<?> updateRecipe(@RequestBody RecipeRequest recipeRequest) {
        recipeService.modifyRecipe(recipeRequest);
        return ApiResponse.success(HttpStatus.OK);
    }

    @Operation(summary = "레시피 재료 조회하기", description = "상품의 레시피 재료를 조회합니다")
    @GetMapping("/list/ingredient")
    public ApiResponse<List<Ingredient>> getListIngredient(@RequestParam("storeId") Integer storeId, @RequestParam("productId") Long productId) {
        List<Ingredient> ingredientList = recipeService.selectIngredient(storeId, productId);
        return ApiResponse.success(HttpStatus.OK, ingredientList);
    }
}
