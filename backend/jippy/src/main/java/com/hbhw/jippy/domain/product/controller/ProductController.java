package com.hbhw.jippy.domain.product.controller;

import com.hbhw.jippy.domain.product.dto.request.CreateProductRequest;
import com.hbhw.jippy.domain.product.dto.request.ProductUpdateRequest;
import com.hbhw.jippy.domain.product.dto.response.ProductDetailListResponse;
import com.hbhw.jippy.domain.product.dto.response.ProductDetailResponse;
import com.hbhw.jippy.domain.product.dto.response.ProductListResponse;
import com.hbhw.jippy.domain.product.dto.response.ProductMonthSoldResponse;
import com.hbhw.jippy.domain.product.entity.Product;
import com.hbhw.jippy.domain.product.service.ProductService;
import com.hbhw.jippy.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/product")
public class ProductController {

    private final ProductService productService;

    @Operation(summary = "매장 별 상품 등록", description = "상품을 등록합니다")
    @PostMapping("{storeId}/create")
    public ApiResponse<?> createProduct(@PathVariable("storeId") Integer storeId,
                                        @RequestPart("createProduct") CreateProductRequest createProductRequest,
                                        @RequestParam(value = "image", required = false) MultipartFile image) {

         productService.createProduct(createProductRequest, image, storeId);
        return ApiResponse.success(HttpStatus.OK);
    }

    @Operation(summary = "매장 별 상품 전체조회", description = "상품 목록을 전체조회합니다")
    @GetMapping("{storeId}/select")
    public ApiResponse<List<ProductListResponse>> selectAllProduct(@PathVariable("storeId") Integer storeId) {
        List<ProductListResponse> productList = productService.getListAllProduct(storeId);
        return ApiResponse.success(productList);
    }

    @Operation(summary = "매장 별 상품 상세조회", description = "상품 상세조회합니다")
    @GetMapping("{storeId}/select/{productId}")
    public ApiResponse<ProductDetailResponse> detailProduct(@PathVariable("storeId") Integer storeId, @PathVariable("productId") Long productId) {
        ProductDetailResponse detailProduct = productService.getDetailProduct(storeId, productId);
        return ApiResponse.success(detailProduct);
    }

    @Operation(summary = "매장 별 상품 정보수정", description = "상품 정보를 수정합니다")
    @PutMapping("{storeId}/update/{productId}")
    public ApiResponse<?> updateProduct(
            @PathVariable("storeId") Integer storeId,
            @PathVariable("productId") Long productId,
            @RequestPart("productUpdateRequest") ProductUpdateRequest productUpdateRequest,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        productService.modifyProduct(storeId, productId, productUpdateRequest, image);
        return ApiResponse.success(HttpStatus.OK);
    }


    @Operation(summary = "매장 별 상품 삭제", description = "상품을 삭제합니다")
    @DeleteMapping("{storeId}/delete/{productId}")
    public ApiResponse<?> deleteProduct(@PathVariable("storeId") Integer storeId, @PathVariable("productId") Long productId) {
        productService.deleteProduct(storeId, productId);
        return ApiResponse.success(HttpStatus.OK);
    }

    @Operation(summary = "매장 별 기간내 상품의 총 판매 개수 및 정보", description = "상품의 총 판매 개수 및 정보를 조회합니다")
    @GetMapping("/{storeId}/fetch/all")
    public ApiResponse<ProductDetailListResponse> fetchAllListProduct(@PathVariable("storeId") Integer storeId, @RequestParam("startDate") String startDate, @RequestParam("endDate") String endDate) {
        ProductDetailListResponse productListResponseList = ProductDetailListResponse.builder()
                .productSoldInfo(productService.fetchAllProductInfo(storeId, startDate, endDate))
                .build();
        return ApiResponse.success(HttpStatus.OK, productListResponseList);
    }

    @Operation(summary = "달 별 상품 판매 개수 정보", description = "상품을 달별 판매 개수 정보를 조회합니다")
    @GetMapping("/{storeId}/fetch/month")
    public ApiResponse<ProductMonthSoldResponse> fetchProductListByMonth(@PathVariable("storeId") Integer storeId, @RequestParam("targetYear") String targetYear) {
        ProductMonthSoldResponse productMonthSoldResponse = productService.fetchMonthProductInfo(storeId, targetYear);
        return ApiResponse.success(HttpStatus.OK, productMonthSoldResponse);
    }
}
