package com.hbhw.jippy.domain.product.service;

import com.hbhw.jippy.domain.product.dto.request.CreateSetMenuRequest;
import com.hbhw.jippy.domain.product.dto.response.SetMenuInfoResponse;
import com.hbhw.jippy.domain.product.dto.response.SetMenuResponse;
import com.hbhw.jippy.domain.product.dto.request.UpdateSetMenuRequest;
import com.hbhw.jippy.domain.product.dto.response.ProductDetailResponse;
import com.hbhw.jippy.domain.product.entity.SetMenu;
import com.hbhw.jippy.domain.product.entity.SetMenuConfig;
import com.hbhw.jippy.domain.product.mapper.ProductMapper;
import com.hbhw.jippy.domain.product.repository.SetMenuRepository;
import com.hbhw.jippy.domain.store.service.StoreService;
import com.hbhw.jippy.global.code.CommonErrorCode;
import com.hbhw.jippy.global.error.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@RequiredArgsConstructor
@Service
public class SetMenuService {
    private final SetMenuRepository setMenuRepository;
    private final SetMenuConfigService setMenuConfigService;
    private final ProductService productService;
    private final StoreService storeService;

    @Transactional
    public void createSetMenu(CreateSetMenuRequest createSetMenuRequest) {

        // SetMenu 엔티티 생성 및 저장
        SetMenu setMenuEntity = SetMenu.builder()
                .price(createSetMenuRequest.getPrice())
                .store(storeService.getStoreEntity(createSetMenuRequest.getStoreId()))
                .image(createSetMenuRequest.getImage())
                .name(createSetMenuRequest.getName())
                .setMenuConfigList(new ArrayList<>())
                .build();

        setMenuRepository.save(setMenuEntity);
        // ExecutorService를 통해 가상 스레드 관리
        try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
            List<CompletableFuture<Void>> completableFutures = new ArrayList<>();

            // 비동기 작업을 가상 스레드로 처리
            for (Long productId : createSetMenuRequest.getProductList()) {
                CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
                    SetMenuConfig setMenuConfigEntity = SetMenuConfig.builder()
                            .setMenu(setMenuEntity)
                            .product(productService.getProduct(createSetMenuRequest.getStoreId(), productId))
                            .build();

                    // SetMenuConfig 엔티티를 SetMenu의 setMenuConfigList에 추가
                    synchronized (setMenuEntity) {
                        setMenuEntity.getSetMenuConfigList().add(setMenuConfigEntity);
                    }
                }, executor);
                completableFutures.add(future);
            }

            // 모든 비동기 작업이 완료될 때까지 기다림
            CompletableFuture.allOf(completableFutures.toArray(new CompletableFuture[0])).join();
        }
    }

    public void deleteSetMenu(Integer setMenuId, Integer storeId) {
        SetMenu setMenuEntity = getSetMenu(setMenuId, storeId);
        setMenuRepository.delete(setMenuEntity);
    }

    /**
     * 나중에 가상스레드로 리팩토링
     */
    @Transactional
    public void modifySetMenu(UpdateSetMenuRequest updateSetMenuRequest) {
        SetMenu setMenuEntity = getSetMenu(updateSetMenuRequest.getSetMenuId(), updateSetMenuRequest.getStoreId());
        setMenuEntity.setName(updateSetMenuRequest.getName());
        setMenuEntity.setImage(updateSetMenuRequest.getImage());
        setMenuEntity.setPrice(updateSetMenuRequest.getPrice());

        List<SetMenuConfig> newSetMenuConfigList = updateSetMenuRequest.getProductIdList().stream()
                .map(product -> setMenuConfigService.getOrCreateSetMenuConfig(setMenuEntity, updateSetMenuRequest.getStoreId(), product))
                .toList();

        for (SetMenuConfig setMenuConfig : setMenuEntity.getSetMenuConfigList()) {
            setMenuConfigService.deleteSetMenuConfig(setMenuConfig);
        }

        setMenuEntity.getSetMenuConfigList().clear();
        setMenuEntity.getSetMenuConfigList().addAll(newSetMenuConfigList);
    }

    public SetMenuInfoResponse selectDetailSetMenuList(Integer storeId) {
        List<SetMenu> setMenuEntityList = setMenuRepository.findByStoreId(storeId);
        List<SetMenuResponse> setMenuResponseList = new ArrayList<>();

        for (SetMenu setMenu : setMenuEntityList) {

            List<ProductDetailResponse> productDetailResponseList = setMenu.getSetMenuConfigList().stream()
                    .map(e -> ProductMapper.convertProductDetailResponse(e.getProduct()))
                    .toList();

            SetMenuResponse setMenuResponse = SetMenuResponse.builder()
                    .productDetailResponseList(productDetailResponseList)
                    .setMenuId(setMenu.getId())
                    .image(setMenu.getImage())
                    .name(setMenu.getName())
                    .price(setMenu.getPrice())
                    .build();
            setMenuResponseList.add(setMenuResponse);
        }
        return SetMenuInfoResponse.builder()
                .setMenuList(setMenuResponseList)
                .build();
    }

    @Transactional(readOnly = true)
    private SetMenu getSetMenu(Integer setMenuId, Integer storeId) {
        return setMenuRepository.findByIdAndStoreId(setMenuId, storeId)
                .orElseThrow(() -> new BusinessException(CommonErrorCode.NOT_FOUND, "세트메뉴가 존재하지 않습니다."));
    }
}
