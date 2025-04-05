package com.hbhw.jippy.domain.stock.service;

import com.hbhw.jippy.domain.stock.dto.request.StockStatusRedis;
import com.hbhw.jippy.domain.stock.dto.response.LowStockInfoResponse;
import com.hbhw.jippy.domain.stock.dto.response.StockStatusResponse;
import com.hbhw.jippy.domain.stock.entity.InventoryItem;
import com.hbhw.jippy.domain.stock.entity.Stock;
import com.hbhw.jippy.domain.stock.repository.StockRepository;
import com.hbhw.jippy.domain.stock.repository.StockStatusRedisRepository;
import com.hbhw.jippy.global.code.CommonErrorCode;
import com.hbhw.jippy.global.error.BusinessException;
import com.hbhw.jippy.utils.DateTimeUtils;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StockStatusService {
    private final StockRepository stockRepository;
    private final StockStatusRedisRepository stockStatusRedisRepository;

    @Data
    @Builder
    public static class StockUpdateInfo {
        private InventoryItem item;
        private int decreaseAmount;
    }

    private boolean checkIsCountable(InventoryItem item) {
        return item.getStock().stream()
                .findFirst()
                .map(stock -> "개".equals(stock.getStockUnit()))
                .orElse(false);
    }

    @Transactional
    public void resetStockStatus(Integer storeId, InventoryItem item) {
        String currentTime = DateTimeUtils.nowString();

        StockStatusRedis oldStatus = stockStatusRedisRepository.getStatus(storeId, item.getStockName());
        int soldStock = oldStatus != null ? oldStatus.getSoldStock() : 0;

        StockStatusRedis newStatus = StockStatusRedis.builder()
                .initialStock(item.getStockTotalValue())
                .soldStock(soldStock)
                .currentStock(item.getStockTotalValue() - soldStock)
                .soldPercentage(calculatePercentage(soldStock, item.getStockTotalValue()))
                .lastUpdated(currentTime)
                .isDessert(checkIsCountable(item))
                .isLowStock(false)
                .build();

        checkLowStock(newStatus);
        stockStatusRedisRepository.saveStatus(storeId, item.getStockName(), newStatus);
    }

    @Transactional
    public void handleStockNameChange(Integer storeId, String oldName, String newName, InventoryItem sourceItem, InventoryItem targetItem) {

        // 기존 재고의 상태 조회
        StockStatusRedis oldStatus = stockStatusRedisRepository.getStatus(storeId, oldName);

        if (oldStatus == null) {
            resetStockStatus(storeId, targetItem);
            return;
        }

        String currentTime = DateTimeUtils.nowString();

        // 새 이름으로 변경되는 경우
        StockStatusRedis newStatus = StockStatusRedis.builder()
                .initialStock(targetItem.getStockTotalValue())
                .soldStock(0)
                .currentStock(targetItem.getStockTotalValue())
                .soldPercentage(0)
                .lastUpdated(currentTime)
                .isDessert(checkIsCountable(targetItem))
                .isLowStock(false)
                .build();

        checkLowStock(newStatus);

        // 변경 전 이름의 재고가 남아있는 경우 상태 업데이트
        if (!sourceItem.getStock().isEmpty()) {
            StockStatusRedis updatedOldStatus = StockStatusRedis.builder()
                    .initialStock(sourceItem.getStockTotalValue())
                    .soldStock(oldStatus.getSoldStock())
                    .currentStock(sourceItem.getStockTotalValue() - oldStatus.getSoldStock())
                    .soldPercentage(calculatePercentage(oldStatus.getSoldStock(), sourceItem.getStockTotalValue()))
                    .lastUpdated(currentTime)
                    .isDessert(oldStatus.getIsDessert())
                    .isLowStock(false)
                    .build();

            checkLowStock(updatedOldStatus);
            stockStatusRedisRepository.saveStatus(storeId, oldName, updatedOldStatus);
        } else {
            // 원래 이름의 재고가 모두 이동 되었을 경우 상태 삭제
            stockStatusRedisRepository.deleteStatus(storeId, oldName);
        }

        stockStatusRedisRepository.saveStatus(storeId, newName, newStatus);
    }

    // 단일 재고 감소 처리
    @Transactional
    public void updateStockStatus(Integer storeId, InventoryItem item, int decreaseAmount) {
        StockStatusRedis status = stockStatusRedisRepository.getStatus(storeId, item.getStockName());
        String currentTime = DateTimeUtils.nowString();

        if (status == null) {
            status = StockStatusRedis.builder()
                    .initialStock(item.getStockTotalValue())
                    .soldStock(decreaseAmount)
                    .currentStock(item.getStockTotalValue() - decreaseAmount)
                    .soldPercentage(calculatePercentage(decreaseAmount, item.getStockTotalValue()))
                    .lastUpdated(currentTime)
                    .isDessert(checkIsCountable(item))
                    .isLowStock(false)
                    .build();
        } else {

            if (status.getCurrentStock() <= 0 || status.getSoldPercentage() >= 100) {
                return;
            }

            status.setSoldStock(status.getSoldStock() + decreaseAmount);
            status.setCurrentStock(item.getStockTotalValue() - status.getSoldStock());
            status.setSoldPercentage(calculatePercentage(status.getSoldStock(), status.getInitialStock()));
            status.setLastUpdated(currentTime);
        }

        checkLowStock(status);
        stockStatusRedisRepository.saveStatus(storeId, item.getStockName(), status);
    }

    // 여러 상품 처리
    @Transactional
    public void updateBatchStockStatus(Integer storeId, List<StockUpdateInfo> updates) {
        Map<String, StockUpdateInfo> mergedUpdates = new HashMap<>();

        if (updates.isEmpty()) {
            return;
        }

        for (StockUpdateInfo update : updates) {
            String stockName = update.getItem().getStockName();
            System.out.println(update.item.getStockName());

            if (mergedUpdates.containsKey(stockName)) {
                mergedUpdates.computeIfPresent(stockName, (k, existing) -> StockUpdateInfo.builder()
                        .item(update.getItem())
                        .decreaseAmount(existing.getDecreaseAmount() + update.getDecreaseAmount())
                        .build());
            } else {
                mergedUpdates.put(stockName, update);
            }
        }

        List<String> stockNames = new ArrayList<>(mergedUpdates.keySet());

        Map<String, StockStatusRedis> currentStatuses = stockStatusRedisRepository.getBatchStatus(storeId, stockNames);
        Map<String, StockStatusRedis> batchUpdates = new HashMap<>();
        String currentTime = DateTimeUtils.nowString();

        for (StockUpdateInfo update : mergedUpdates.values()) {
            StockStatusRedis currentStatus = currentStatuses.get(update.getItem().getStockName());
            if (currentStatus == null) {
                System.out.println(update);

                StockStatusRedis newStatus = StockStatusRedis.builder()
                        .initialStock(update.getItem().getStockTotalValue())
                        .soldStock(update.getDecreaseAmount())
                        .currentStock(update.getItem().getStockTotalValue() - update.getDecreaseAmount())
                        .soldPercentage(calculatePercentage(update.getDecreaseAmount(), update.getItem().getStockTotalValue()))
                        .lastUpdated(currentTime)
                        .isDessert(checkIsCountable(update.getItem()))
                        .isLowStock(false)
                        .build();
                checkLowStock(newStatus);
                batchUpdates.put(update.getItem().getStockName(), newStatus);
            } else {
                if (currentStatus.getCurrentStock() <= 0 || currentStatus.getSoldPercentage() >= 100) {
                    continue;
                }

                int newSoldStock = currentStatus.getSoldStock() + update.getDecreaseAmount();
                StockStatusRedis updatedStatus = StockStatusRedis.builder()
                        .initialStock(currentStatus.getInitialStock())
                        .soldStock(newSoldStock)
                        .currentStock(currentStatus.getInitialStock() - newSoldStock)
                        .soldPercentage(calculatePercentage(newSoldStock, currentStatus.getInitialStock()))
                        .lastUpdated(currentTime)
                        .isDessert(currentStatus.getIsDessert())
                        .isLowStock(currentStatus.getIsLowStock())
                        .build();

                checkLowStock(updatedStatus);
                batchUpdates.put(update.getItem().getStockName(), updatedStatus);
            }
        }
        if (!batchUpdates.isEmpty()) {
            stockStatusRedisRepository.saveBatchStatus(storeId, batchUpdates);
            Map<String, StockStatusRedis> verifiedStatus = stockStatusRedisRepository.getBatchStatus(storeId, stockNames);
        }
    }

    private Integer calculatePercentage(Integer sold, Integer total) {
        return total == 0 ? 0 : (sold * 100) / total;
    }

    private void checkLowStock(StockStatusRedis status) {
        if (Boolean.TRUE.equals(status.getIsDessert())) {
            // 디저트 개수 체크
            status.setIsLowStock(status.getCurrentStock() <= 3);
        } else {
            // 판매율 체크 (회의 필요)
            status.setIsLowStock(status.getSoldPercentage() >= 70);
        }
    }

    @Transactional
    public void handleStockDelete(Integer storeId, String stockName, InventoryItem remainingItem) {
        StockStatusRedis oldStatus = stockStatusRedisRepository.getStatus(storeId, stockName);

        if (oldStatus == null) return;

        if (remainingItem == null || remainingItem.getStock().isEmpty()) {
            stockStatusRedisRepository.deleteStatus(storeId, stockName);
        } else {
            String currentTime = DateTimeUtils.nowString();
            StockStatusRedis newStatus = StockStatusRedis.builder()
                    .initialStock(remainingItem.getStockTotalValue())
                    .soldStock(oldStatus.getSoldStock())
                    .currentStock(remainingItem.getStockTotalValue() - oldStatus.getSoldStock())
                    .soldPercentage(calculatePercentage(oldStatus.getSoldStock(), remainingItem.getStockTotalValue()))
                    .lastUpdated(currentTime)
                    .isDessert(oldStatus.getIsDessert())
                    .isLowStock(false)
                    .build();

            checkLowStock(newStatus);
            stockStatusRedisRepository.saveStatus(storeId, stockName, newStatus);
        }
    }

    public StockStatusResponse getStockStatus(Integer storeId) {
        Stock stock = stockRepository.findByStoreId(storeId)
                .orElseThrow(() -> new BusinessException(CommonErrorCode.NOT_FOUND, "해당 매장의 재고 정보를 찾을 수 없습니다"));

        List<String> stockNames = stock.getInventory().stream()
                .map(InventoryItem::getStockName)
                .collect(Collectors.toList());

        Map<String, StockStatusRedis> statusMap = stockStatusRedisRepository.getBatchStatus(storeId, stockNames);
        List<LowStockInfoResponse> lowStockList = new ArrayList<>();

        for (InventoryItem item : stock.getInventory()) {
            StockStatusRedis status = statusMap.get(item.getStockName());

            if (status != null && Boolean.TRUE.equals(status.getIsLowStock())) {
                lowStockList.add(LowStockInfoResponse.builder()
                        .stockName(item.getStockName())
                        .soldPercentage(Math.min(status.getSoldPercentage(), 100))
                        .remainingStock(Math.max(status.getCurrentStock(), 0))
                        .build());
            }
        }

        return StockStatusResponse.builder()
                .storeId(storeId)
                .hasLowStock(!lowStockList.isEmpty())
                .lowStockList(lowStockList)
                .build();
    }

}
