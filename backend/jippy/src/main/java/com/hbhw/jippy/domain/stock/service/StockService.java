package com.hbhw.jippy.domain.stock.service;

import com.hbhw.jippy.domain.stock.dto.request.*;
import com.hbhw.jippy.domain.stock.dto.response.InventoryItemResponse;
import com.hbhw.jippy.domain.stock.dto.response.StockDetailResponse;
import com.hbhw.jippy.domain.stock.dto.response.StockResponse;
import com.hbhw.jippy.domain.stock.entity.*;
import com.hbhw.jippy.domain.stock.repository.StockRepository;
import com.hbhw.jippy.global.code.CommonErrorCode;
import com.hbhw.jippy.global.error.BusinessException;
import com.hbhw.jippy.utils.DateTimeUtils;
import lombok.RequiredArgsConstructor;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StockService {

    private static final Map<String, String> UNIT_STANDARDIZATION = Map.of(
            "kg", "g",
            "l", "ml",
            "개", "개"
    );

    private static final Map<String, Integer> UNIT_CONVERSION = Map.of(
            "kg", 1000,
            "g", 1,
            "l", 1000,
            "ml", 1,
            "개", 1
    );
    private final StockStatusService stockStatusService;

    // 재고 입력 시, 띄어쓰기 무시하고 비교하는 공통 메소드
    private boolean compareStockNames(String name1, String name2) {
        if (name1 == null || name2 == null) {
            return false;
        }
        return name1.replaceAll("\\s+", "").equals(name2.replaceAll("\\s+", ""));
    }

    private final StockRepository stockRepository;
    private final MongoTemplate mongoTemplate;
    private final ApplicationEventPublisher eventPublisher;

    private ObjectId getStockId(Integer storeId) {
        Document document = mongoTemplate.findOne(
                Query.query(Criteria.where("store_id").is(storeId)),
                Document.class,
                "stock"
        );
        return document != null ? document.get("_id", ObjectId.class) : null;
    }

    private StockDetail convertToStandardUnit(StockDetailCreateUpdateRequest request) {

        if (request.getStockUnit().equals("개")) {
            return StockDetail.builder()
                    .stockCount(request.getStockCount())
                    .stockUnitSize(request.getStockCount())
                    .stockUnit("개")
                    .build();
        }

        String standardUnit = UNIT_STANDARDIZATION.getOrDefault(request.getStockUnit(), request.getStockUnit());

        if (request.getStockUnit().equals(standardUnit)) {
            return StockDetail.builder()
                    .stockCount(request.getStockCount())
                    .stockUnitSize(request.getStockUnitSize())
                    .stockUnit(standardUnit)
                    .build();
        }

        int conversionFactor = UNIT_CONVERSION.getOrDefault(request.getStockUnit(), 1);

        return StockDetail.builder()
                .stockCount(request.getStockCount())
                .stockUnitSize(request.getStockUnitSize() * conversionFactor)
                .stockUnit(standardUnit)
                .build();
    }

    private StockDetailDeleteRequest convertDeleteRequestToStandardUnit(StockDetailDeleteRequest request) {

        String standardUnit = UNIT_STANDARDIZATION.getOrDefault(request.getStockUnit(), request.getStockUnit());

        if (request.getStockUnit().equals(standardUnit)) {
            return request;
        }

        int conversionFactor = UNIT_CONVERSION.getOrDefault(request.getStockUnit(), 1);

        StockDetailDeleteRequest standardizedRequest = new StockDetailDeleteRequest();
        standardizedRequest.setStockUnit(standardUnit);
        standardizedRequest.setStockUnitSize(request.getStockUnitSize() * conversionFactor);

        return standardizedRequest;
    }

    @Transactional
    public StockResponse addInventory(Integer storeId, StockCreateUpdateRequest request) {
        if (request.getInventory() == null || request.getInventory().isEmpty()) {
            throw new BusinessException(CommonErrorCode.INVALID_INPUT_VALUE, "재고 정보가 필요합니다");
        }

        Stock stock = stockRepository.findByStoreId(storeId)
                .orElseGet(() -> Stock.builder()
                        .storeId(storeId)
                        .inventory(new ArrayList<>())
                        .build());

        if (stockRepository.findByStoreId(storeId).isEmpty()) {
            Query query = new Query(Criteria.where("store_id").is(storeId));
            Update update = new Update().set("inventory", stock.getInventory());
            mongoTemplate.upsert(query, update, Stock.class);
        }

        ObjectId stockId = getStockId(storeId);

        request.getInventory().forEach(newItem -> {
            Optional<InventoryItem> exactMatch = stock.getInventory().stream()
                    .filter(item -> item.getStockName().equals(newItem.getStockName()))
                    .findFirst();

            Optional<InventoryItem> existingItem = exactMatch.isPresent() ? exactMatch :
                    stock.getInventory().stream()
                        .filter(item -> compareStockNames(item.getStockName(), newItem.getStockName()))
                        .findFirst();

            if (existingItem.isPresent()) {
                Map<String, StockDetail> existingStocks = existingItem.get().getStock().stream()
                        .collect(Collectors.toMap(
                                detail -> detail.getStockUnit() + detail.getStockUnitSize(),
                                Function.identity()
                        ));

                newItem.getStock().forEach(stockDetail -> {
                    StockDetail convertedDetail = convertToStandardUnit(stockDetail);
                    String key = convertedDetail.getStockUnit() + convertedDetail.getStockUnitSize();
                    StockDetail existing = existingStocks.get(key);

                    StockLogCreateRequest logRequest = StockLogCreateRequest.builder()
                            .storeId(storeId)
                            .stockId(stockId)
                            .stockName(existingItem.get().getStockName())
                            .stockUnitSize(convertedDetail.getStockUnitSize())
                            .changeType(ChangeType.INCREASE)
                            .changeReason(ChangeReason.PURCHASE)
                            .beforeStockCount(existing != null ? existing.getStockCount() : 0)
                            .afterStockCount((existing != null ? existing.getStockCount() : 0) + convertedDetail.getStockCount())
                            .build();
                    eventPublisher.publishEvent(new StockLogService.StockLogEvent(logRequest));
                });

                updateInventoryItem(existingItem.get(), newItem);
                recalculateTotalValues(stock);
                stockStatusService.resetStockStatus(storeId, existingItem.get());
            } else {
                newItem.getStock().forEach(stockDetail -> {
                    StockDetail convertedDetail = convertToStandardUnit(stockDetail);

                    StockLogCreateRequest logRequest = StockLogCreateRequest.builder()
                            .storeId(storeId)
                            .stockId(stockId)
                            .stockName(newItem.getStockName())
                            .stockUnitSize(convertedDetail.getStockUnitSize())
                            .changeType(ChangeType.INCREASE)
                            .changeReason(ChangeReason.PURCHASE)
                            .beforeStockCount(0)
                            .afterStockCount(convertedDetail.getStockCount())
                            .build();
                    eventPublisher.publishEvent(new StockLogService.StockLogEvent(logRequest));
                });
                addNewInventoryItem(stock, newItem);

                Optional<InventoryItem> addedItem = stock.getInventory().stream()
                        .filter(item -> compareStockNames(item.getStockName(), newItem.getStockName()))
                        .findFirst();

                addedItem.ifPresent(item -> {
                    recalculateTotalValues(stock);
                    stockStatusService.resetStockStatus(storeId, item);
                });
            }
        });

        recalculateTotalValues(stock);

        Query query = new Query(Criteria.where("store_id").is(storeId));
        Update update = new Update().set("inventory", stock.getInventory());

        mongoTemplate.upsert(query, update, Stock.class);

        return mapEntityToResponse(stock);
    }

    private void updateInventoryItem(InventoryItem existingItem, InventoryItemCreateUpdateRequest newItem) {
        existingItem.setUpdatedAt(DateTimeUtils.nowString());
        mergeStockDetails(existingItem, newItem);
    }

    private void mergeStockDetails(InventoryItem existingItem, InventoryItemCreateUpdateRequest newItem) {
        newItem.getStock().forEach(newStock -> {
            StockDetail convertedNewStock = convertToStandardUnit(newStock);

            Optional<StockDetail> existingStock = existingItem.getStock().stream()
                    .filter(stock -> {
                        if (stock.getStockUnit().equals(convertedNewStock.getStockUnit())) {
                            if (stock.getStockUnit().equals("개")) {
                                return true;
                            }
                            return stock.getStockUnitSize().equals(convertedNewStock.getStockUnitSize());
                        } else {
                            String standardUnit = UNIT_STANDARDIZATION.getOrDefault(stock.getStockUnit(), stock.getStockUnit());
                            if (!standardUnit.equals(stock.getStockUnit())) {
                                int standardSize = stock.getStockUnitSize() * UNIT_CONVERSION.get(stock.getStockUnit());
                                return standardSize == convertedNewStock.getStockUnitSize() &&
                                        convertedNewStock.getStockUnit().equals(standardUnit);
                            }
                        }
                        return false;
                    })
                    .findFirst();

            if (existingStock.isPresent()) {
                int newCount = existingStock.get().getStockCount() + convertedNewStock.getStockCount();
                existingStock.get().setStockCount(newCount);

                if (existingStock.get().getStockUnit().equals("개")) {
                    existingStock.get().setStockCount(newCount);
                    existingStock.get().setStockUnitSize(newCount);
                }
            } else {
                existingItem.getStock().add(convertedNewStock);
            }
        });
    }

    private void addNewInventoryItem(Stock stock, InventoryItemCreateUpdateRequest newItem) {
        stock.getInventory().add(mapToInventoryItem(newItem));
    }

    private void recalculateTotalValues(Stock stock) {

        stock.getInventory().forEach(item -> {
            int totalValue = item.getStock().stream()
                        .mapToInt(detail -> {
                            if (detail.getStockUnit().equals("개")) {
                                return detail.getStockCount();
                            }
                            return detail.getStockUnitSize() * detail.getStockCount();
                        })
                        .sum();
            item.setStockTotalValue(totalValue);
        });
    }

    private InventoryItem mapToInventoryItem(InventoryItemCreateUpdateRequest request) {
        List<StockDetail> convertedStocks = request.getStock().stream()
                .map(this::convertToStandardUnit)
                .collect(Collectors.toList());

        Map<String, Map<Integer, StockDetail>> groupedStocks = new HashMap<>();

        convertedStocks.forEach(stock -> {
            groupedStocks
                    .computeIfAbsent(stock.getStockUnit(), k -> new HashMap<>())
                    .merge(stock.getStockUnitSize(),
                            stock,
                            (existing, newStock) -> {
                                existing.setStockCount(existing.getStockCount() + newStock.getStockCount());
                                return existing;
                            });
        });

        List<StockDetail> mergedStocks = groupedStocks.values().stream()
                .flatMap(sizeMap -> sizeMap.values().stream())
                .collect(Collectors.toList());

        return InventoryItem.builder()
                .stockName(request.getStockName())
                .stockTotalValue(0)
                .updatedAt(DateTimeUtils.nowString())
                .stock(mergedStocks)
                .build();
    }

    private StockResponse mapEntityToResponse(Stock entity) {
        return StockResponse.builder()
                .storeId(entity.getStoreId())
                .inventory(entity.getInventory().stream()
                        .map(this::mapToInventoryItemResponse)
                        .collect(Collectors.toList()))
                .build();
    }

    private InventoryItemResponse mapToInventoryItemResponse(InventoryItem item) {
        String totalUnit = item.getStock().stream()
                .map(StockDetail::getStockUnit)
                .findFirst()
                .orElse("g");

        boolean hasML = item.getStock().stream().anyMatch(detail -> detail.getStockUnit().equals("ml"));
        boolean hasG = item.getStock().stream().anyMatch(detail -> detail.getStockUnit().equals("g"));

        if (hasML) {
            totalUnit = "ml";
        } else if (hasG) {
            totalUnit = "g";
        }

        return InventoryItemResponse.builder()
                .stockName(item.getStockName())
                .stockTotalValue(item.getStockTotalValue())
                .totalUnit(totalUnit)
                .updatedAt(item.getUpdatedAt())
                .stock(item.getStock().stream()
                        .map(this::mapToStockDetailResponse)
                        .collect(Collectors.toList()))
                .build();
    }

    private StockDetailResponse mapToStockDetailResponse(StockDetail detail) {
        String displayUnit = detail.getStockUnit();
        int displaySize = detail.getStockUnitSize();

        if (detail.getStockUnit().equals("g") && detail.getStockUnitSize() >= 1000 &&
            detail.getStockUnitSize() % 1000 == 0) {
            displayUnit = "kg";
            displaySize = detail.getStockUnitSize() / 1000;
        } else if (detail.getStockUnit().equals("ml") && detail.getStockUnitSize() >= 1000 &&
            detail.getStockUnitSize() % 1000 == 0) {
            displayUnit = "l";
            displaySize = detail.getStockUnitSize() / 1000;
        }

        return StockDetailResponse.builder()
                .stockCount(detail.getStockCount())
                .stockUnitSize(displaySize)
                .stockUnit(displayUnit)
                .build();
    }

    public StockResponse getInventory(Integer storeId) {
        return stockRepository.findByStoreId(storeId)
                .map(this::mapEntityToResponse)
                .orElse(StockResponse.builder()
                        .storeId(storeId)
                        .inventory(new ArrayList<>())
                        .build());
    }

    @Transactional
    public StockResponse updateInventory(Integer storeId, String stockName, StockCreateUpdateRequest request) {
        Stock stock = stockRepository.findByStoreId(storeId)
                .orElseThrow(() -> new BusinessException(CommonErrorCode.NOT_FOUND, "해당 매장의 재고 정보를 찾을 수 없습니다"));

        InventoryItem sourceItem = stock.getInventory().stream()
                .filter(item -> compareStockNames(item.getStockName(), stockName))
                .findFirst()
                .orElseThrow(() -> new BusinessException(CommonErrorCode.NOT_FOUND, "해당 상품의 재고 정보를 찾을 수 없습니다"));

        if (request.getInventory() == null || request.getInventory().isEmpty()) {
            throw new BusinessException(CommonErrorCode.INVALID_INPUT_VALUE, "수정할 재고 정보가 필요합니다");
        }

        InventoryItemCreateUpdateRequest updateRequest = request.getInventory().get(0);
        ObjectId stockId = getStockId(storeId);

        if (updateRequest.getStockName() != null && !updateRequest.getStockName().equals(stockName)) {

            Optional<InventoryItem> exactMatch = stock.getInventory().stream()
                    .filter(item -> item.getStockName().equals(updateRequest.getStockName()))
                    .findFirst();

            Optional<InventoryItem> targetItemOpt = (exactMatch.isPresent() ? exactMatch :
                    stock.getInventory().stream()
                            .filter(item -> compareStockNames(item.getStockName(), updateRequest.getStockName()))
                            .findFirst());

            InventoryItem targetItem = targetItemOpt.orElseGet(() -> {
                InventoryItem newItem = InventoryItem.builder()
                        .stockName(updateRequest.getStockName())
                        .stockTotalValue(0)
                        .stock(new ArrayList<>())
                        .updatedAt(DateTimeUtils.nowString())
                        .build();
                stock.getInventory().add(newItem);
                return newItem;
            });

            if (!updateRequest.getStock().isEmpty()) {

                // 이름 변경과 재고 이동 둘 다 있는 경우
                updateRequest.getStock().forEach(moveDetail -> {
                    StockDetail convertedMoveDetail = convertToStandardUnit(moveDetail);

                    Optional<StockDetail> sourceDetail = sourceItem.getStock().stream()
                            .filter(detail -> {
                                if (detail.getStockUnit().equals(convertedMoveDetail.getStockUnit())) {
                                    if (detail.getStockUnit().equals("개")) {
                                        return true;
                                    }
                                    return detail.getStockUnitSize().equals(convertedMoveDetail.getStockUnitSize());
                                } else {
                                    String standardUnit = UNIT_STANDARDIZATION.getOrDefault(detail.getStockUnit(), detail.getStockUnit());
                                    if (!standardUnit.equals(detail.getStockUnit())) {
                                        int standardSize = detail.getStockUnitSize() * UNIT_CONVERSION.get(detail.getStockUnit());
                                        return standardSize == convertedMoveDetail.getStockUnitSize() &&
                                                convertedMoveDetail.getStockUnit().equals(standardUnit);
                                    }
                                }
                                return false;
                            })
                            .findFirst();

                    if (!sourceDetail.isPresent()) {
                        throw new BusinessException(
                                CommonErrorCode.NOT_FOUND,
                                String.format("해당 용량과 단위의 재고가 존재하지 않습니다 : %d%s",
                                        convertedMoveDetail.getStockUnitSize(),
                                        convertedMoveDetail.getStockUnit())
                        );
                    }

                    Optional<StockDetail> targetDetail = targetItem.getStock().stream()
                            .filter(detail -> {
                                if (detail.getStockUnit().equals(convertedMoveDetail.getStockUnit())) {
                                    if (detail.getStockUnit().equals("개")) {
                                        return true;
                                    }
                                    return detail.getStockUnitSize().equals(convertedMoveDetail.getStockUnitSize());
                                } else {
                                    String standardUnit = UNIT_STANDARDIZATION.getOrDefault(detail.getStockUnit(), detail.getStockUnit());
                                    if (!standardUnit.equals(detail.getStockUnit())) {
                                        int standardSize = detail.getStockUnitSize() * UNIT_CONVERSION.get(detail.getStockUnit());
                                        return standardSize == convertedMoveDetail.getStockUnitSize() &&
                                                convertedMoveDetail.getStockUnit().equals(standardUnit);
                                    }
                                }
                                return false;
                            })
                            .findFirst();

                    int targetBeforeCount = targetDetail.map(StockDetail::getStockCount).orElse(0);

                    // 변경 전 이름을 가진 재고에서 수량이 감소하는 로그
                    StockLogCreateRequest outLogRequest = StockLogCreateRequest.builder()
                            .storeId(storeId)
                            .stockId(stockId)
                            .stockName(sourceItem.getStockName())
                            .stockUnitSize(convertedMoveDetail.getStockUnitSize())
                            .changeType(ChangeType.DECREASE)
                            .changeReason(ChangeReason.MODIFICATION)
                            .beforeStockCount(sourceDetail.get().getStockCount())
                            .afterStockCount(sourceDetail.get().getStockCount() - convertedMoveDetail.getStockCount())
                            .build();

                    // 변경 후 이름을 가진 재고에서 수량이 증가하는 로그
                    StockLogCreateRequest inLogRequest = StockLogCreateRequest.builder()
                            .storeId(storeId)
                            .stockId(stockId)
                            .stockName(targetItem.getStockName())
                            .stockUnitSize(convertedMoveDetail.getStockUnitSize())
                            .changeType(ChangeType.INCREASE)
                            .changeReason(ChangeReason.MODIFICATION)
                            .beforeStockCount(targetBeforeCount)
                            .afterStockCount(targetBeforeCount + convertedMoveDetail.getStockCount())
                            .build();

                    eventPublisher.publishEvent(new StockLogService.StockLogEvent(outLogRequest));
                    eventPublisher.publishEvent(new StockLogService.StockLogEvent(inLogRequest));

                    sourceItem.getStock().remove(sourceDetail.get());


                    if (targetDetail.isPresent()) {
                        targetDetail.get().setStockCount(
                                targetDetail.get().getStockCount() + convertedMoveDetail.getStockCount()
                        );
                    } else {
                        targetItem.getStock().add(convertedMoveDetail);
                    }
                });

                sourceItem.setUpdatedAt(DateTimeUtils.nowString());
                recalculateTotalValues(stock);
                // redis 상태 업데이트 (이름 변경, 재고 이동 후)
                stockStatusService.handleStockNameChange(storeId, stockName, updateRequest.getStockName(), sourceItem, targetItem);
            } else {
                // 단순 이름 변경인 경우
                sourceItem.getStock().forEach(stockDetail -> {
                    Optional<StockDetail> targetDetail = targetItem.getStock().stream()
                            .filter(detail -> detail.getStockUnit().equals(stockDetail.getStockUnit()) &&
                                    detail.getStockUnitSize().equals(stockDetail.getStockUnitSize()))
                            .findFirst();

                    int targetBeforeCount = targetDetail.map(StockDetail::getStockCount).orElse(0);

                    StockLogCreateRequest outLogRequest = StockLogCreateRequest.builder()
                            .storeId(storeId)
                            .stockId(stockId)
                            .stockName(stockName)
                            .stockUnitSize(stockDetail.getStockUnitSize())
                            .changeType(ChangeType.DECREASE)
                            .changeReason(ChangeReason.MODIFICATION)
                            .beforeStockCount(stockDetail.getStockCount())
                            .afterStockCount(0)
                            .build();

                    StockLogCreateRequest inLogRequest = StockLogCreateRequest.builder()
                            .storeId(storeId)
                            .stockId(stockId)
                            .stockName(updateRequest.getStockName())
                            .stockUnitSize(stockDetail.getStockUnitSize())
                            .changeType(ChangeType.INCREASE)
                            .changeReason(ChangeReason.MODIFICATION)
                            .beforeStockCount(targetBeforeCount)
                            .afterStockCount(targetBeforeCount + stockDetail.getStockCount())
                            .build();

                    eventPublisher.publishEvent(new StockLogService.StockLogEvent(outLogRequest));
                    eventPublisher.publishEvent(new StockLogService.StockLogEvent(inLogRequest));
                });

                InventoryItem newItem = InventoryItem.builder()
                        .stockName(updateRequest.getStockName())
                        .stockTotalValue(sourceItem.getStockTotalValue())
                        .stock(new ArrayList<>(sourceItem.getStock()))
                        .updatedAt(DateTimeUtils.nowString())
                        .build();
                stock.getInventory().add(newItem);
                stock.getInventory().remove(sourceItem);

                recalculateTotalValues(stock);

                stockStatusService.handleStockNameChange(storeId, stockName, updateRequest.getStockName(), sourceItem, newItem);
            }

            sourceItem.setUpdatedAt(DateTimeUtils.nowString());
        } else {
            // 단순 수량만 수정하는 경우
            updateRequest.getStock().forEach(newStock -> {
                StockDetail convertedNewStock = convertToStandardUnit(newStock);

                Optional<StockDetail> existingStock = sourceItem.getStock().stream()
                        .filter(detail -> {
                            if (detail.getStockUnit().equals(convertedNewStock.getStockUnit())) {
                                if (detail.getStockUnit().equals("개")) {
                                    return true;
                                }
                                return detail.getStockUnitSize().equals(convertedNewStock.getStockUnitSize());
                            } else {
                                String standardUnit = UNIT_STANDARDIZATION.getOrDefault(detail.getStockUnit(), detail.getStockUnit());
                                if (!standardUnit.equals(detail.getStockUnit())) {
                                    int standardSize = detail.getStockUnitSize() * UNIT_CONVERSION.get(detail.getStockUnit());
                                    return standardSize == convertedNewStock.getStockUnitSize() &&
                                            convertedNewStock.getStockUnit().equals(standardUnit);
                                }
                            }
                            return false;
                        })
                        .findFirst();

                if (existingStock.isPresent()) {

                    int beforeCount = existingStock.get().getStockCount();
                    int afterCount = convertedNewStock.getStockCount();

                    if (existingStock.get().getStockUnit().equals("개")) {
                        existingStock.get().setStockCount(afterCount);
                        existingStock.get().setStockUnitSize(afterCount);
                    }

                    ChangeType changeType;
                    ChangeReason changeReason;

                    if (afterCount < beforeCount &&
                        Boolean.TRUE.equals(newStock.getIsDisposal())) {
                        // 폐기 시 수량 감소
                        changeType = ChangeType.DISPOSAL;
                        changeReason = ChangeReason.DISPOSAL;
                    } else {
                        // 기본 수량 변경 시 수정으로 체크
                        changeType = afterCount > beforeCount ? ChangeType.INCREASE : ChangeType.DECREASE;
                        changeReason = ChangeReason.MODIFICATION;
                    }

                    StockLogCreateRequest logRequest = StockLogCreateRequest.builder()
                            .storeId(storeId)
                            .stockId(stockId)
                            .stockName(sourceItem.getStockName())
                            .stockUnitSize(convertedNewStock.getStockUnitSize())
                            .changeType(changeType)
                            .changeReason(changeReason)
                            .beforeStockCount(beforeCount)
                            .afterStockCount(afterCount)
                            .build();

                    eventPublisher.publishEvent(new StockLogService.StockLogEvent(logRequest));
                    existingStock.get().setStockCount(convertedNewStock.getStockCount());
                } else {
                    throw new BusinessException(
                            CommonErrorCode.NOT_FOUND,
                            String.format("해당 용량과 단위의 재고가 존재하지 않습니다 : %d%s",
                                    convertedNewStock.getStockUnitSize(),
                                    convertedNewStock.getStockUnit())
                    );
                }
            });

            sourceItem.setUpdatedAt(DateTimeUtils.nowString());
        }

        if (sourceItem.getStock().isEmpty()) {
            stock.getInventory().remove(sourceItem);
        }

        recalculateTotalValues(stock);
        stockStatusService.resetStockStatus(storeId, sourceItem);

        Query query = new Query(Criteria.where("store_id").is(storeId));
        Update update = new Update().set("inventory", stock.getInventory());
        mongoTemplate.upsert(query, update, Stock.class);

        return mapEntityToResponse(stock);
    }

    @Transactional
    public StockResponse deleteInventoryItem(Integer storeId, String stockName, StockDeleteRequest request) {
        if (request.getInventory() == null || request.getInventory().isEmpty()) {
            throw new BusinessException(CommonErrorCode.INVALID_INPUT_VALUE, "삭제할 재고 정보가 필요합니다");
        }

        Stock stock = stockRepository.findByStoreId(storeId)
                .orElseThrow(() -> new BusinessException(CommonErrorCode.NOT_FOUND, "해당 매장의 재고 정보를 찾을 수 없습니다"));

        InventoryItem targetItem = stock.getInventory().stream()
                .filter(item -> compareStockNames(item.getStockName(), stockName))
                .findFirst()
                .orElseThrow(() -> new BusinessException(CommonErrorCode.NOT_FOUND, "해당 상품의 재고 정보를 찾을 수 없습니다"));

        ObjectId stockId = getStockId(storeId);

        request.getInventory().forEach(deleteRequest -> {
            deleteRequest.getStock().forEach(stockDetailDelete -> {
                StockDetailDeleteRequest standardizedDeleteRequest = convertDeleteRequestToStandardUnit(stockDetailDelete);

                Optional<StockDetail> stockToDelete = targetItem.getStock().stream()
                        .filter(stockDetail -> {
                            if (stockDetail.getStockUnit().equals(standardizedDeleteRequest.getStockUnit())) {
                                if (stockDetail.getStockUnit().equals("개")) {
                                    return true;
                                }
                                return stockDetail.getStockUnitSize().equals(standardizedDeleteRequest.getStockUnitSize());
                            } else {
                                String standardUnit = UNIT_STANDARDIZATION.getOrDefault(stockDetail.getStockUnit(), stockDetail.getStockUnit());
                                if (!standardUnit.equals(stockDetail.getStockUnit())) {
                                    int standardSize = stockDetail.getStockUnitSize() * UNIT_CONVERSION.get(stockDetail.getStockUnit());
                                    return standardSize == standardizedDeleteRequest.getStockUnitSize() &&
                                            standardizedDeleteRequest.getStockUnit().equals(standardUnit);
                                }
                            }
                            return false;
                        })
                        .findFirst();

                if (stockToDelete.isPresent()) {
                    ChangeType changeType = Boolean.TRUE.equals(stockDetailDelete.getIsDisposal()) ?
                            ChangeType.DISPOSAL : ChangeType.DECREASE;
                    ChangeReason changeReason = Boolean.TRUE.equals(stockDetailDelete.getIsDisposal()) ?
                            ChangeReason.DISPOSAL : ChangeReason.MODIFICATION;

                    StockLogCreateRequest logRequest = StockLogCreateRequest.builder()
                            .storeId(storeId)
                            .stockId(stockId)
                            .stockName(targetItem.getStockName())
                            .stockUnitSize(standardizedDeleteRequest.getStockUnitSize())
                            .changeType(changeType)
                            .changeReason(changeReason)
                            .beforeStockCount(stockToDelete.get().getStockCount())
                            .afterStockCount(0)
                            .build();

                    eventPublisher.publishEvent(new StockLogService.StockLogEvent(logRequest));
                    targetItem.getStock().remove(stockToDelete.get());
                } else {
                    throw new BusinessException(
                            CommonErrorCode.NOT_FOUND,
                            String.format("해당 용량의 재고를 찾을 수 없습니다: %d%s",
                                    standardizedDeleteRequest.getStockUnitSize(),
                                    standardizedDeleteRequest.getStockUnit())
                    );
                }
            });
            targetItem.setUpdatedAt(DateTimeUtils.nowString());
        });

        if (targetItem.getStock().isEmpty()) {
            stock.getInventory().remove(targetItem);
            recalculateTotalValues(stock);
            stockStatusService.handleStockDelete(storeId, stockName, null);
        } else {
            recalculateTotalValues(stock);
            stockStatusService.handleStockDelete(storeId, stockName, targetItem);
        }

        Query query = new Query(Criteria.where("store_id").is(storeId));
        Update update = new Update().set("inventory", stock.getInventory());
        mongoTemplate.upsert(query, update, Stock.class);

        return mapEntityToResponse(stock);
    }

    public List<InventoryItem> getInventoryItemList(Integer storeId){
        return stockRepository.findByStoreId(storeId)
                .map(Stock::getInventory).orElseThrow(() -> new BusinessException(CommonErrorCode.NOT_FOUND, "재고 인벤토리가 존재하지 않습니다."));
    }
}