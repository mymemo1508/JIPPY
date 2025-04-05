package com.hbhw.jippy.domain.stock.controller;

import com.hbhw.jippy.domain.stock.dto.response.StockStatusResponse;
import com.hbhw.jippy.domain.stock.service.StockStatusService;
import com.hbhw.jippy.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Stock Status", description = "매장의 재고 상태 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/stock-status/{storeId}")
public class StockStatusController {
    private final StockStatusService stockStatusService;

    @Operation(summary = "매장의 재고 상태 조회", description = "매장의 재고 부족 상태를 조회합니다.")
    @GetMapping("/select")
    public ApiResponse<StockStatusResponse> getStockStatus(
            @Parameter(description = "매장 ID")
            @PathVariable Integer storeId) {
        StockStatusResponse response = stockStatusService.getStockStatus(storeId);
        return ApiResponse.success(response);
    }
}
