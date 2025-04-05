package com.hbhw.jippy.domain.stock.service;

import com.hbhw.jippy.domain.stock.dto.request.StockLogCreateRequest;
import com.hbhw.jippy.domain.stock.entity.StockLog;
import com.hbhw.jippy.domain.stock.repository.StockLogRepository;
import com.hbhw.jippy.global.code.CommonErrorCode;
import com.hbhw.jippy.global.error.BusinessException;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class StockLogService {

    private final StockLogRepository stockLogRepository;

    @Getter
    @Builder
    public static class StockLogEvent {
        private final StockLogCreateRequest stockLogCreateRequest;
    }

    @Component
    @RequiredArgsConstructor
    public static class StockLogEventListener {
        private final StockLogService stockLogService;

        @Async
        @EventListener
        public void handleStockLogEvent(StockLogEvent event) {
            stockLogService.createStockLog(event.getStockLogCreateRequest());
        }
    }

    public void createStockLog(StockLogCreateRequest dto) {
        try {
            StockLog stockLog = dto.toEntity();
            stockLogRepository.save(stockLog);
        } catch (Exception e) {
            throw new BusinessException(CommonErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional(readOnly = true)
    public List<StockLog> findStockLogsByStoreId(Integer storeId) {
        List<StockLog> stockLogs = stockLogRepository.findStockLogsByStoreId(storeId);
        if (stockLogs.isEmpty()) {
            throw new BusinessException(CommonErrorCode.NOT_FOUND);
        }
        return stockLogs;
    }
}