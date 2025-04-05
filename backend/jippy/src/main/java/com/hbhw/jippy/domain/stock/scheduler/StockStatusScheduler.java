package com.hbhw.jippy.domain.stock.scheduler;

import com.hbhw.jippy.domain.stock.repository.StockStatusRedisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class StockStatusScheduler {
    private final StockStatusRedisRepository stockStatusRedis;

    // 매일 자정에 판매 재고량 초기화
    @Scheduled(cron = "0 0 0 * * *", zone = "Asia/Seoul")
    public void resetDailySoldStock() {
        stockStatusRedis.resetAllSoldStock();
    }
}
