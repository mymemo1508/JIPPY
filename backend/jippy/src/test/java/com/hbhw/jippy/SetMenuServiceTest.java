package com.hbhw.jippy;

import com.hbhw.jippy.domain.product.dto.request.CreateSetMenuRequest;
import com.hbhw.jippy.domain.product.dto.request.UpdateSetMenuRequest;
import com.hbhw.jippy.domain.product.dto.response.ProductListResponse;
import com.hbhw.jippy.domain.product.dto.response.SetMenuInfoResponse;
import com.hbhw.jippy.domain.product.dto.response.SetMenuResponse;
import com.hbhw.jippy.domain.product.entity.Product;
import com.hbhw.jippy.domain.product.entity.ProductCategory;
import com.hbhw.jippy.domain.product.entity.SetMenu;
import com.hbhw.jippy.domain.product.entity.SetMenuConfig;
import com.hbhw.jippy.domain.product.enums.ProductSize;
import com.hbhw.jippy.domain.product.enums.ProductType;
import com.hbhw.jippy.domain.product.repository.SetMenuRepository;
import com.hbhw.jippy.domain.product.service.ProductService;
import com.hbhw.jippy.domain.product.service.SetMenuConfigService;
import com.hbhw.jippy.domain.product.service.SetMenuService;
import com.hbhw.jippy.domain.store.entity.Store;
import com.hbhw.jippy.domain.store.service.StoreService;
import com.hbhw.jippy.domain.user.entity.UserOwner;
import com.hbhw.jippy.domain.user.enums.StaffType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@MockitoSettings(strictness = Strictness.LENIENT)
@ExtendWith(MockitoExtension.class)
public class SetMenuServiceTest {
    @InjectMocks
    private SetMenuService setMenuService;
    @Mock
    private SetMenuRepository setMenuRepository;
    @Mock
    private SetMenuConfigService setMenuConfigService;
    @Mock
    private ProductService productService;
    @Mock
    private StoreService storeService;

    private SetMenu setMenu;
    private UpdateSetMenuRequest updateRequest;

    @BeforeEach
    void setUp() {
        setMenu = SetMenu.builder()
                .id(1)
                .image("setmenu1.img")
                .name("브런치세트")
                .price(8800)
                .setMenuConfigList(new ArrayList<>())
                .build();

        updateRequest = new UpdateSetMenuRequest();
        updateRequest.setSetMenuId(1);
        updateRequest.setStoreId(1);
        updateRequest.setName("New Name");
        updateRequest.setImage("new-image.png");
        updateRequest.setPrice(2000);
        updateRequest.setProductIdList(List.of(10L, 20L));
    }

    @Test
    void createSetMenu_Success(){

        SetMenu mockSetMenu = SetMenu.builder()
                .id(1)
                .image("setmenu1.img")
                .name("브런치세트")
                .price(8800)
                .setMenuConfigList(new ArrayList<>())
                .build();
        UserOwner mockUserOwner1 = new UserOwner("owner1@example.com", "password1", "김싸피", "1999-01-15", StaffType.OWNER, "fcmToken1");
        Store mockStore = Store.builder()
                .id(1)  // 매장 ID
                .userOwner(mockUserOwner1)  // 점주 정보
                .name("테스트 매장")
                .address("서울특별시 강남구 테헤란로 123")
                .openingDate("2024-01-01")
                .totalCash(1000000)
                .businessRegistrationNumber("123-45-67890")
                .build();

        Product product1 = Product.builder()
                .id(1L)
                .store(mockStore)
                .name("아메리카노")
                .price(4500)
                .status(true)
                .image("americano.jpg")
                .productType(ProductType.ICE) // 가정: ProductType Enum 값
                .productSize(ProductSize.L) // 가정: ProductSize Enum 값
                .store(Store.builder()
                        .id(1)
                        .name("카페 하루")
                        .build()
                )
                .productCategory(ProductCategory.builder()
                        .id(2)
                        .productCategoryName("커피")
                        .build()
                )
                .build();

        Product product2 = Product.builder()
                .id(2L)
                .store(mockStore)
                .name("카페라떼")
                .price(3500)
                .status(true)
                .image("caffelatte.jpg")
                .productType(ProductType.ICE) // 가정: ProductType Enum 값
                .productSize(ProductSize.L) // 가정: ProductSize Enum 값
                .store(Store.builder()
                        .id(1)
                        .name("카페 하루")
                        .build()
                )
                .productCategory(ProductCategory.builder()
                        .id(2)
                        .productCategoryName("커피")
                        .build()
                )
                .build();

        SetMenuConfig mockSetMenuConfig1 = mock(SetMenuConfig.class);
        when(mockSetMenuConfig1.getSetMenu()).thenReturn(mockSetMenu);
        when(mockSetMenuConfig1.getProduct()).thenReturn(product1);

        SetMenuConfig mockSetMenuConfig2 = mock(SetMenuConfig.class);
        when(mockSetMenuConfig2.getSetMenu()).thenReturn(mockSetMenu);
        when(mockSetMenuConfig2.getProduct()).thenReturn(product2);

        List<SetMenuConfig> mockSetMenuConfig = Arrays.asList(mockSetMenuConfig1, mockSetMenuConfig2);
        mockSetMenu.setSetMenuConfigList(mockSetMenuConfig);

        CreateSetMenuRequest mockCreateSetMenuRequest = mock(CreateSetMenuRequest.class);
        setMenuService.createSetMenu(mockCreateSetMenuRequest);

        assertNotNull(mockSetMenu);
        assertEquals("브런치세트", mockSetMenu.getName());
        assertEquals("setmenu1.img", mockSetMenu.getImage());
        assertEquals("아메리카노", mockSetMenu.getSetMenuConfigList().get(0).getProduct().getName());
        assertEquals("카페라떼", mockSetMenu.getSetMenuConfigList().get(1).getProduct().getName());
        assertEquals(4500, mockSetMenu.getSetMenuConfigList().get(0).getProduct().getPrice());
        assertEquals(3500, mockSetMenu.getSetMenuConfigList().get(1).getProduct().getPrice());
        assertEquals(8800, mockSetMenu.getPrice());
        verify(setMenuRepository, times(1)).save(any(SetMenu.class));
    }

    @Test
    void modifySetMenu_success() {

        Product mockProduct = mock(Product.class);
        SetMenu mockSetMenu = mock(SetMenu.class);
        when(mockSetMenu.getPrice()).thenReturn(2000);
        when(mockSetMenu.getName()).thenReturn("New Name");
        when(mockSetMenu.getImage()).thenReturn("new-image.png");

        SetMenuConfig mockNewSetMenuConfig = SetMenuConfig.builder()
                .setMenu(mockSetMenu)
                .product(mockProduct)
                .build();

        when(setMenuRepository.findByIdAndStoreId(anyInt(), anyInt())).thenReturn(Optional.ofNullable(setMenu));
        when(setMenuConfigService.getOrCreateSetMenuConfig(setMenu, 1, 1L))
                .thenReturn(mockNewSetMenuConfig);

        setMenuService.modifySetMenu(updateRequest);

        assertNotNull(setMenu);
        assertEquals("New Name", setMenu.getName());
        assertEquals("new-image.png", setMenu.getImage());
        assertEquals(2000, setMenu.getPrice());
        assertEquals(2, setMenu.getSetMenuConfigList().size());
    }

    @Test
    void selectDetailSetMenuList_success() {
        Integer storeId = 100;
        List<SetMenu> setMenuList = new ArrayList<>();

        SetMenu setMenu1 = mock(SetMenu.class);
        when(setMenu1.getName()).thenReturn("set1_name");
        when(setMenu1.getImage()).thenReturn("set1_image");
        when(setMenu1.getPrice()).thenReturn(5000);

        SetMenu setMenu2 = mock(SetMenu.class);
        when(setMenu2.getName()).thenReturn("set2_name");
        when(setMenu2.getImage()).thenReturn("set2_image");
        when(setMenu2.getPrice()).thenReturn(7000);
        setMenuList.add(setMenu1);
        setMenuList.add(setMenu2);

        when(setMenuRepository.findByStoreId(storeId)).thenReturn(setMenuList);
        SetMenuInfoResponse response = setMenuService.selectDetailSetMenuList(storeId);

        assertNotNull(response);
        assertEquals(2, response.getSetMenuList().size());
        assertEquals("set1_name", response.getSetMenuList().get(0).getName());
        assertEquals("set1_image", response.getSetMenuList().get(0).getImage());
        assertEquals(5000, response.getSetMenuList().get(0).getPrice());
        assertEquals("set2_name", response.getSetMenuList().get(1).getName());
        assertEquals("set2_image", response.getSetMenuList().get(1).getImage());
        assertEquals(7000, response.getSetMenuList().get(1).getPrice());
    }

    public Store getMockStore(){
        SetMenu mockSetMenu = SetMenu.builder()
                .id(1)
                .image("setmenu1.img")
                .name("브런치세트")
                .price(8800)
                .setMenuConfigList(new ArrayList<>())
                .build();
        UserOwner mockUserOwner1 = new UserOwner("owner1@example.com", "password1", "김싸피", "1999-01-15", StaffType.OWNER, "fcmToken1");
        // 매장 ID
        // 점주 정보
        return Store.builder()
                .id(1)  // 매장 ID
                .userOwner(mockUserOwner1)  // 점주 정보
                .name("테스트 매장")
                .address("서울특별시 강남구 테헤란로 123")
                .openingDate("2024-01-01")
                .totalCash(1000000)
                .businessRegistrationNumber("123-45-67890")
                .build();
    }

    public Product getMockProduct1(){
        Store mockStore = getMockStore();
        return Product.builder()
                .id(1L)
                .store(mockStore)
                .name("아메리카노")
                .price(4500)
                .status(true)
                .image("americano.jpg")
                .productType(ProductType.ICE) // 가정: ProductType Enum 값
                .productSize(ProductSize.L) // 가정: ProductSize Enum 값
                .store(Store.builder()
                        .id(1)
                        .name("카페 하루")
                        .build()
                )
                .productCategory(ProductCategory.builder()
                        .id(2)
                        .productCategoryName("커피")
                        .build()
                )
                .build();
    }

    public Product getMockProduct2() {
        Store mockStore = getMockStore();
        return Product.builder()
                .id(2L)
                .store(mockStore)
                .name("카페라떼")
                .price(3500)
                .status(true)
                .image("caffelatte.jpg")
                .productType(ProductType.ICE) // 가정: ProductType Enum 값
                .productSize(ProductSize.L) // 가정: ProductSize Enum 값
                .store(Store.builder()
                        .id(1)
                        .name("카페 하루")
                        .build()
                )
                .productCategory(ProductCategory.builder()
                        .id(2)
                        .productCategoryName("커피")
                        .build()
                )
                .build();
    }

    public List<SetMenuConfig> getMockSetMenuConfigList(){
        Product product1 = getMockProduct1();
        Product product2 = getMockProduct2();

        SetMenuConfig mockSetMenuConfig1 = mock(SetMenuConfig.class);
        when(mockSetMenuConfig1.getSetMenu()).thenReturn(setMenu);
        when(mockSetMenuConfig1.getProduct()).thenReturn(product1);

        SetMenuConfig mockSetMenuConfig2 = mock(SetMenuConfig.class);
        when(mockSetMenuConfig2.getSetMenu()).thenReturn(setMenu);
        when(mockSetMenuConfig2.getProduct()).thenReturn(product2);

        return Arrays.asList(mockSetMenuConfig1, mockSetMenuConfig2);
    }
}
