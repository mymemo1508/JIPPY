package com.hbhw.jippy;

import com.hbhw.jippy.domain.stock.dto.request.InventoryItemCreateUpdateRequest;
import com.hbhw.jippy.domain.stock.dto.request.StockCreateUpdateRequest;
import com.hbhw.jippy.domain.stock.dto.request.StockDetailCreateUpdateRequest;
import com.hbhw.jippy.domain.stock.dto.response.StockResponse;
import com.hbhw.jippy.domain.stock.entity.InventoryItem;
import com.hbhw.jippy.domain.stock.entity.Stock;
import com.hbhw.jippy.domain.stock.entity.StockDetail;
import com.hbhw.jippy.domain.stock.repository.StockRepository;
import com.hbhw.jippy.domain.stock.service.StockLogService;
import com.hbhw.jippy.domain.stock.service.StockService;
import com.hbhw.jippy.domain.stock.service.StockStatusService;
import com.hbhw.jippy.global.error.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@MockitoSettings(strictness = Strictness.LENIENT)
@ExtendWith(MockitoExtension.class)
public class StockServiceTest {
//    @InjectMocks
//    private StockService stockService;
//    @Mock
//    private StockStatusService stockStatusService;
//    @Mock
//    private StockRepository stockRepository;
//    @Mock
//    private MongoTemplate mongoTemplate;
//    @Mock
//    private ApplicationEventPublisher eventPublisher;
//    private InventoryItem inventoryItem;
//
//    private Stock stock;
//
//    @BeforeEach
//    void setUp() {
//        stock = new Stock();
//        stock.setStoreId(100);
//        stock.setInventory(new ArrayList<>());
//        inventoryItem = new InventoryItem("Milk", 20, "2024-01-15", List.of(new StockDetail(2, 10, "L")));
//
//    }
//
//    @Test
//    void addInventory_Success() {
//        Integer storeId = 1;
//        StockCreateUpdateRequest request = new StockCreateUpdateRequest();
//
//        InventoryItemCreateUpdateRequest inventoryItemCreateUpdateRequest = mock(InventoryItemCreateUpdateRequest.class);
//        when(inventoryItemCreateUpdateRequest.getStockName()).thenReturn("우유");
//
//        List<InventoryItemCreateUpdateRequest> mockList = List.of(inventoryItemCreateUpdateRequest);
//        ReflectionTestUtils.setField(request, "inventory", mockList);
//
//        when(stockRepository.findByStoreId(storeId)).thenReturn(Optional.of(stock));
//
//        StockResponse response = stockService.addInventory(storeId, request);
//
//        assertNotNull(response);
//        assertEquals(1, response.getInventory().size());
//        assertEquals("우유", response.getInventory().get(0).getStockName());
//    }
//
//    @Test
//    void addInventory_Success_ExistingItem() {
//        // Given
//        Integer storeId = 1;
//        StockCreateUpdateRequest request = new StockCreateUpdateRequest();
//
//        InventoryItemCreateUpdateRequest inventoryItemDto = mock(InventoryItemCreateUpdateRequest.class);
//        when(inventoryItemDto.getStockName()).thenReturn("우유");
//
//        StockDetailCreateUpdateRequest stockDetail = new StockDetailCreateUpdateRequest(2, 10, "L", true);
//        when(inventoryItemDto.getStock()).thenReturn(List.of(stockDetail));
//
//        ReflectionTestUtils.setField(request, "inventory", List.of(inventoryItemDto));
//
//        // 기존 재고 (InventoryItem)
//        List<StockDetail> mockList = new ArrayList<>(List.of(new StockDetail(2, 50, "L")));
//        ReflectionTestUtils.setField(stock, "inventory", mockList);
//
//        List<InventoryItem> inventoryItems = new ArrayList<>();
//        inventoryItems.add(new InventoryItem("우유", 100, "2020-11-11", mockList));
//        Stock stock = new Stock(storeId, inventoryItems);
//
//        when(stockRepository.findByStoreId(storeId)).thenReturn(Optional.of(stock));
//        StockResponse response = stockService.addInventory(storeId, request);
//
//        // Then
//        assertNotNull(response);
//        assertEquals(1, response.getInventory().size());
//        assertEquals("우유", response.getInventory().get(0).getStockName());
//        assertEquals(2, response.getInventory().get(0).getStock().get(0).getStockCount()); // 기존 + 새로운 수량 검증
//
//        // 이벤트 발행 검증
//        verify(eventPublisher, atLeastOnce()).publishEvent(any(StockLogService.StockLogEvent.class));
//    }
//
//    @Test
//    void addInventory_Empty() {
//        Integer storeId = 100;
//        StockCreateUpdateRequest request = new StockCreateUpdateRequest();
//        ReflectionTestUtils.setField(request, "inventory", List.of());
//
//
//        when(stockRepository.findByStoreId(storeId)).thenReturn(Optional.empty());
//        BusinessException exception = assertThrows(BusinessException.class, () ->
//                stockService.addInventory(storeId, request)
//        );
//
//        assertEquals("재고 정보가 필요합니다", exception.getMessage());
//    }
//
//    @Test
//    void testUpdateInventory_StoreNotFound() {
//        Integer storeId = 1;
//        String stockName = "test-stock";
//        StockCreateUpdateRequest request = new StockCreateUpdateRequest();
//
//        when(stockRepository.findByStoreId(storeId)).thenReturn(Optional.empty());
//
//        assertThrows(BusinessException.class, () -> stockService.updateInventory(storeId, stockName, request));
//    }
//
//    @Test
//    void testUpdateInventory_ItemNotFound() {
//        Integer storeId = 1;
//        String stockName = "No-stock";
//        StockCreateUpdateRequest request = new StockCreateUpdateRequest();
//
//        Stock stock = new Stock();
//        stock.setInventory(new ArrayList<>());
//
//        when(stockRepository.findByStoreId(storeId)).thenReturn(Optional.of(stock));
//        assertThrows(BusinessException.class, () -> stockService.updateInventory(storeId, stockName, request));
//    }
//
//    @Test
//    void testUpdateInventory_EmptyInventory() {
//        // given
//        Integer storeId = 1;
//        String stockName = "test-stock";
//        StockCreateUpdateRequest request = new StockCreateUpdateRequest();
//        InventoryItemCreateUpdateRequest mockList = mock(InventoryItemCreateUpdateRequest.class);
//        ReflectionTestUtils.setField(request, "inventory", List.of(mockList));
//
//        Stock stock = new Stock();
//        stock.setInventory(new ArrayList<>());
//
//        when(stockRepository.findByStoreId(storeId)).thenReturn(Optional.of(stock));
//
//        // when & then
//        assertThrows(BusinessException.class, () -> stockService.updateInventory(storeId, stockName, request));
//    }
//
//    @Test
//    void testUpdateInventory_NameChangeAndStockMove() {
//        // given
//        Integer storeId = 1;
//        String stockName = "test-stock";
//        String newStockName = "new-stock";
//        StockCreateUpdateRequest request = new StockCreateUpdateRequest();
//
//        // Mock 데이터 설정
//        InventoryItemCreateUpdateRequest mockData = mock(InventoryItemCreateUpdateRequest.class);
//        List<InventoryItemCreateUpdateRequest> mockList = List.of(mockData);
//        ReflectionTestUtils.setField(request, "inventory", mockList);
//
//        // Mock 반환 값 설정
//        StockDetailCreateUpdateRequest stockDetail = new StockDetailCreateUpdateRequest(2, 10, "L", true);
//        when(mockData.getStock()).thenReturn(List.of(stockDetail));
//
//        InventoryItem sourceItem = new InventoryItem();
//        sourceItem.setStockName(stockName);
//        sourceItem.setStock(Arrays.asList(new StockDetail(1, 10, "g"), new StockDetail(1, 10, "g")));
//
//        Stock stock = new Stock();
//        stock.setInventory(Collections.singletonList(sourceItem));
//
//        when(stockRepository.findByStoreId(storeId)).thenReturn(Optional.of(stock));
//
//        // When
//        stockService.updateInventory(storeId, stockName, request);
//
//        // Then
//        verify(eventPublisher, times(1)).publishEvent(any(StockLogService.StockLogEvent.class));
//    }





}
