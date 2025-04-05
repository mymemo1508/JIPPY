package com.hbhw.jippy.domain.product.service;

import com.hbhw.jippy.domain.product.dto.request.CreateCategoryRequest;
import com.hbhw.jippy.domain.product.dto.response.CategoryListResponse;
import com.hbhw.jippy.domain.product.entity.ProductCategory;
import com.hbhw.jippy.domain.product.mapper.ProductMapper;
import com.hbhw.jippy.domain.product.repository.ProductCategoryRepository;
import com.hbhw.jippy.domain.store.entity.Store;
import com.hbhw.jippy.domain.store.service.StoreService;
import com.hbhw.jippy.global.code.CommonErrorCode;
import com.hbhw.jippy.global.error.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductCategoryService {
    private final ProductCategoryRepository productCategoryRepository;
    private final StoreService storeService;

    /***
     *  카테고리 추가
     */
    public void addCategory(String categoryName, Integer storeId) {

        Store storeEntity = storeService.getStoreEntity(storeId);

        ProductCategory productCategoryEntity = ProductCategory.builder()
                .productCategoryName(categoryName)
                .store(storeEntity)
                .build();

        productCategoryRepository.save(productCategoryEntity);
    }

    /***
     *  카테고리 목록 조회
     */
    public List<CategoryListResponse> findAllCategory(Integer storeId) {
        List<ProductCategory> productCategories = productCategoryRepository.findByStoreId(storeId);

        return productCategories.stream()
                .map(ProductMapper::convertCategoryListResponse)
                .toList();
    }

    /***
     *  카테고리 이름 변경
     */
    @Transactional
    public void updateCategoryName(Integer storeId, Integer categoryId, CreateCategoryRequest createCategoryRequest) {
        ProductCategory productCategoryEntity = getProductCategoryEntity(storeId, categoryId);
        productCategoryEntity.setProductCategoryName(createCategoryRequest.getCategoryName());
    }

    /***
     *  카테고리 삭제
     */
    public void deleteCategoryName(Integer storeId, Integer categoryId) {
        ProductCategory productCategoryEntity = getProductCategoryEntity(storeId, categoryId);
        productCategoryRepository.delete(productCategoryEntity);
    }

    /***
     *  특정한 카테고리 조회
     */
    public ProductCategory getProductCategoryEntity(Integer storeId, Integer categoryId) {
        return productCategoryRepository.findByStoreIdAndId(storeId, categoryId)
                .orElseThrow(() -> new BusinessException(CommonErrorCode.NOT_FOUND, "존재하지 않는 카테고리 입니다"));
    }

}
