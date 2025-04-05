package com.hbhw.jippy.domain.stock.controller;

import com.hbhw.jippy.domain.stock.dto.request.StockCreateUpdateRequest;
import com.hbhw.jippy.domain.stock.dto.request.StockDeleteRequest;
import com.hbhw.jippy.domain.stock.dto.response.StockResponse;
import com.hbhw.jippy.domain.stock.service.StockService;
import com.hbhw.jippy.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Stock", description = "재고 관리 API")
@RestController
@RequestMapping("/api/stock/{storeId}")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;

    @Operation(summary = "재고 등록", description = "매장의 재고 정보를 등록한다")
    @io.swagger.v3.oas.annotations.responses.ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "등록 성공",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "잘못된 요청",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "409",
                    description = "중복된 재고 정보",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "500",
                    description = "데이터베이스 오류",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            )
    })
    @PostMapping("/create")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<StockResponse> addInventory(
            @Parameter(description = "매장 ID")
            @PathVariable Integer storeId,
            @RequestBody StockCreateUpdateRequest request) {
        StockResponse response = stockService.addInventory(storeId, request);
        return ApiResponse.success(HttpStatus.CREATED, response);
    }

    @Operation(summary = "재고 조회", description = "매장의 재고 정보를 조회한다")
    @io.swagger.v3.oas.annotations.responses.ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "재고 정보를 찾을 수 없음",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "500",
                    description = "데이터베이스 오류",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            )
    })
    @GetMapping("/select")
    public ApiResponse<StockResponse> getInventory(
            @Parameter(description = "매장 ID")
            @PathVariable Integer storeId) {
        StockResponse response = stockService.getInventory(storeId);
        return ApiResponse.success(response);
    }

    @Operation(summary = "재고 수정", description = "특정 재고 항목을 수정한다")
    @io.swagger.v3.oas.annotations.responses.ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "수정 성공",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "잘못된 요청",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "재고 정보를 찾을 수 없음",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "500",
                    description = "데이터베이스 오류",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            )
    })
    @PutMapping("/update/{stockName}")
    public ApiResponse<StockResponse> updateInventory(
            @Parameter(description = "매장 ID")
            @PathVariable Integer storeId,
            @Parameter(description = "재고 이름")
            @PathVariable String stockName,
            @RequestBody StockCreateUpdateRequest request) {
        StockResponse response = stockService.updateInventory(storeId, stockName, request);
        return ApiResponse.success(response);
    }

    @Operation(summary = "재고 삭제", description = "특정 재고 항목을 삭제한다")
    @io.swagger.v3.oas.annotations.responses.ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "삭제 성공",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "재고 정보를 찾을 수 없음",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "500",
                    description = "데이터베이스 오류",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            )
    })
    @DeleteMapping("/delete/{stockName}")
    public ApiResponse<StockResponse> deleteInventory(
            @Parameter(description = "매장 ID")
            @PathVariable Integer storeId,
            @Parameter(description = "재고 이름")
            @PathVariable String stockName,
            @RequestBody StockDeleteRequest request) {
        StockResponse response = stockService.deleteInventoryItem(storeId, stockName, request);
        return ApiResponse.success(response);
    }
}
