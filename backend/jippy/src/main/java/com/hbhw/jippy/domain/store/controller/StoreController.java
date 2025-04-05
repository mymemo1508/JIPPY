package com.hbhw.jippy.domain.store.controller;

import com.hbhw.jippy.domain.chat.service.ChatService;
import com.hbhw.jippy.domain.store.dto.request.StoreCreateRequest;
import com.hbhw.jippy.domain.store.dto.request.StoreUpdateRequest;
import com.hbhw.jippy.domain.store.dto.response.StoreResponse;
import com.hbhw.jippy.domain.store.service.StoreService;
import com.hbhw.jippy.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/store")
@RequiredArgsConstructor
public class StoreController {

    private final StoreService storeService;
    private final ChatService chatService;

    @Operation(summary = "매장 등록", description = "새로운 매장을 등록한다.")
    // @PreAuthorize("hasRole('OWNER')")
    @PostMapping("/create")
    public ApiResponse<StoreResponse> createStore(@RequestBody StoreCreateRequest request) {
        StoreResponse response = storeService.createStore(request);
        chatService.createChat(response.getId());
        return ApiResponse.success(response);
    }


    @Operation(summary = "매장 정보 수정", description = "기존 매장 정보를 수정한다.")
    // @PreAuthorize("hasRole('OWNER')")
    @PutMapping("/update/{storeId}")
    public ApiResponse<StoreResponse> updateStore(
            @PathVariable("storeId") Integer storeId,
            @RequestBody StoreUpdateRequest request
    ) {
        StoreResponse response = storeService.updateStore(storeId, request);
        return ApiResponse.success(response);
    }

    @Operation(summary = "매장 상세 조회", description = "매장 ID로 상세 정보를 조회한다.")
    // @PreAuthorize("hasRole('OWNER')")
    @GetMapping("/select/{storeId}")
    public ApiResponse<StoreResponse> getStore(@PathVariable("storeId") Integer storeId) {
        StoreResponse response = storeService.getStore(storeId);
        return ApiResponse.success(response);
    }

    @Operation(summary = "소유 매장 조회", description = "점주 id로 매장 리스트를 조회한다.")
    @GetMapping("/select/list")
    public ApiResponse<List<StoreResponse>> getStoreListByOwnerId(@RequestParam("ownerId") Integer ownerId) {
        List<StoreResponse> response = storeService.getStoreListByOwnerId(ownerId);
        return ApiResponse.success(response);
    }


    @Operation(summary = "매장 삭제", description = "매장을 삭제한다.")
    // @PreAuthorize("hasRole('OWNER')")
    @DeleteMapping("/delete/{storeId}")
    public ApiResponse<Void> deleteStore(@PathVariable("storeId") Integer storeId) {
        storeService.deleteStore(storeId);
        chatService.deleteChat(storeId);
        return ApiResponse.success(HttpStatus.OK);
    }
}