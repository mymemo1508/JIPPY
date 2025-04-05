package com.hbhw.jippy.domain.stock.repository;

import com.hbhw.jippy.domain.stock.dto.request.StockStatusRedis;
import com.hbhw.jippy.utils.DateTimeUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class StockStatusRedisRepository {
    private final RedisTemplate<String, Object> redisTemplate;
    private static final String KEY_PREFIX = "stock:status:";

    private String generateKey(Integer storeId, String stockName) {
        return KEY_PREFIX + storeId + ":" + stockName;
    }

    public void saveStatus(Integer storeId, String stockName, StockStatusRedis status) {
        String key = generateKey(storeId, stockName);
        redisTemplate.opsForValue().set(key, status);
    }

    public void saveBatchStatus(Integer storeId, Map<String, StockStatusRedis> statusMap) {
        Map<String, Object> batch = new HashMap<>();
        statusMap.forEach((stockName, status) -> {
            String key = generateKey(storeId, stockName);
            batch.put(key, status);
        });

        redisTemplate.opsForValue().multiSet(batch);
    }

    public StockStatusRedis getStatus(Integer storeId, String stockName) {
        String key = generateKey(storeId, stockName);
        Object value = redisTemplate.opsForValue().get(key);

        if (value instanceof StockStatusRedis) {
            return (StockStatusRedis) value;
        } else if (value instanceof LinkedHashMap) {
            @SuppressWarnings("unchecked")
            LinkedHashMap<String, Object> map = (LinkedHashMap<String, Object>) value;

            return StockStatusRedis.builder()
                    .initialStock((Integer) map.get("initialStock"))
                    .soldStock((Integer) map.get("soldStock"))
                    .currentStock((Integer) map.get("currentStock"))
                    .soldPercentage((Integer) map.get("soldPercentage"))
                    .lastUpdated(DateTimeUtils.nowString())
                    .isDessert((Boolean) map.get("isDessert"))
                    .isLowStock((Boolean) map.get("isLowStock"))
                    .build();
        }
        return null;
    }

    public Map<String, StockStatusRedis> getBatchStatus(Integer storeId, List<String> stockNames) {
        List<String> keys = stockNames.stream()
                .map(name -> generateKey(storeId, name))
                .collect(Collectors.toList());

        List<Object> values = redisTemplate.opsForValue().multiGet(keys);
        Map<String, StockStatusRedis> result = new HashMap<>();

        if (values != null) {
            for (int i = 0; i < stockNames.size(); i++) {
                Object value = values.get(i);

                if (value != null) {
                    String stockName = stockNames.get(i);

                    if (value instanceof StockStatusRedis) {
                        result.put(stockName, (StockStatusRedis) value);
                    } else if (value instanceof LinkedHashMap) {
                        @SuppressWarnings("unchecked")
                        LinkedHashMap<String, Object> map = (LinkedHashMap<String, Object>) value;
                        result.put(stockName, StockStatusRedis.builder()
                                .initialStock((Integer) map.get("initialStock"))
                                .soldStock((Integer) map.get("soldStock"))
                                .currentStock((Integer) map.get("currentStock"))
                                .soldPercentage((Integer) map.get("soldPercentage"))
                                .lastUpdated(DateTimeUtils.nowString())
                                .isDessert((Boolean) map.get("isDessert"))
                                .isLowStock((Boolean) map.get("isLowStock"))
                                .build());
                    }
                }
            }
        }
        return result;
    }

    public Map<String, StockStatusRedis> getStoreStatus(Integer storeId) {
        String pattern = KEY_PREFIX + storeId + ":*";
        Set<String> keys = redisTemplate.keys(pattern);

        if (keys == null || keys.isEmpty()) {
            return new HashMap<>();
        }

        Map<String, StockStatusRedis> statusMap = new HashMap<>();

        for (String key : keys) {
            String stockName = key.substring((KEY_PREFIX + storeId + ":").length());
            StockStatusRedis status = getStatus(storeId, stockName);

            if (status != null) {
                statusMap.put(stockName, status);
            }
        }
        return statusMap;
    }

    public void deleteStatus(Integer storeId, String stockName) {
        String key = generateKey(storeId, stockName);
        redisTemplate.delete(key);
    }

    public void deleteBatchStatus(Integer storeId, List<String> stockNames) {
        List<String> keys = stockNames.stream()
                .map(name -> generateKey(storeId, name))
                .collect(Collectors.toList());

        redisTemplate.delete(keys);
    }

    public void resetAllSoldStock() {
        Set<String> keys = redisTemplate.keys(KEY_PREFIX + "*");

        if (keys == null || keys.isEmpty()) {
            return;
        }

        List<Object> values = redisTemplate.opsForValue().multiGet(keys);
        Map<String, StockStatusRedis> updates = new HashMap<>();

        if (values != null) {
            for (int i = 0; i < keys.size(); i++) {
                String key = new ArrayList<>(keys).get(i);
                Object value = values.get(i);

                if (value instanceof StockStatusRedis) {
                    StockStatusRedis status = (StockStatusRedis) value;
                    StockStatusRedis resetStatus = StockStatusRedis.builder()
                            .initialStock(status.getInitialStock())
                            .soldStock(0)
                            .currentStock(status.getInitialStock())
                            .soldPercentage(0)
                            .lastUpdated(DateTimeUtils.nowString())
                            .isDessert(status.getIsDessert())
                            .isLowStock(false)
                            .build();
                    updates.put(key, resetStatus);
                } else if (value instanceof LinkedHashMap) {
                    @SuppressWarnings("unchecked")
                    LinkedHashMap<String, Object> map = (LinkedHashMap<String, Object>) value;
                    StockStatusRedis resetStatus = StockStatusRedis.builder()
                            .initialStock((Integer) map.get("initialStock"))
                            .soldStock(0)
                            .currentStock((Integer) map.get("initialStock"))
                            .soldPercentage(0)
                            .lastUpdated(DateTimeUtils.nowString())
                            .isDessert((Boolean) map.get("isDessert"))
                            .isLowStock(false)
                            .build();
                    updates.put(key, resetStatus);
                }
            }

            if (!updates.isEmpty()) {
                redisTemplate.opsForValue().multiSet(updates);
            }
        }
    }
}
