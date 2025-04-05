package com.hbhw.jippy.domain.product.controller;

import com.hbhw.jippy.domain.product.dto.request.CreateCategoryRequest;
import com.hbhw.jippy.domain.product.dto.response.CategoryListResponse;
import com.hbhw.jippy.domain.product.service.ProductCategoryService;
import com.hbhw.jippy.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/category")
public class ProductCategoryController {

    private final ProductCategoryService productCategoryService;

    @PostMapping("{storeId}/create")
    public ApiResponse<?> createCategory(@RequestBody CreateCategoryRequest createCategoryRequest, @PathVariable("storeId") Integer storeId) {
        productCategoryService.addCategory(createCategoryRequest.getCategoryName(), storeId);
        return ApiResponse.success(HttpStatus.CREATED);
    }

    @GetMapping("{storeId}/select")
    public ApiResponse<List<CategoryListResponse>> selectCategory(@PathVariable("storeId") Integer storeId) {
        List<CategoryListResponse> categoryListResponses = productCategoryService.findAllCategory(storeId);
        return ApiResponse.success(HttpStatus.OK, categoryListResponses);
    }

    @PutMapping("{storeId}/update/{categoryId}")
    public ApiResponse<?> updateCategory(@RequestBody CreateCategoryRequest createCategoryRequest, @PathVariable("storeId") Integer storeId, @PathVariable("categoryId") Integer categoryId) {
        productCategoryService.updateCategoryName(storeId, categoryId, createCategoryRequest);
        return ApiResponse.success(HttpStatus.OK);
    }

    @DeleteMapping("{storeId}/delete/{categoryId}")
    public ApiResponse<?> deleteCategory(@PathVariable("storeId") Integer storeId, @PathVariable("categoryId") Integer categoryId) {
        productCategoryService.deleteCategoryName(storeId, categoryId);
        return ApiResponse.success(HttpStatus.OK);
    }
}
