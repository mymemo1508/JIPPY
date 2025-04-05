package com.hbhw.jippy.domain.product.service;

import com.hbhw.jippy.domain.product.entity.SetMenu;
import com.hbhw.jippy.domain.product.entity.SetMenuConfig;
import com.hbhw.jippy.domain.product.repository.SetMenuConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class SetMenuConfigService {
    private final SetMenuConfigRepository setMenuConfigRepository;
    private final ProductService productService;

    public void deleteSetMenuConfig(SetMenuConfig setMenuConfig) {
        setMenuConfigRepository.delete(setMenuConfig);
    }

    @Transactional
    public SetMenuConfig getOrCreateSetMenuConfig(SetMenu setMenu, Integer storeId, Long productId) {
        return setMenuConfigRepository.findBySetMenuIdAndProductId(setMenu.getId(), productId)
                .orElseGet(() -> SetMenuConfig.builder()
                        .product(productService.getProduct(storeId, productId))
                        .setMenu(setMenu)
                        .build());
    }
}
