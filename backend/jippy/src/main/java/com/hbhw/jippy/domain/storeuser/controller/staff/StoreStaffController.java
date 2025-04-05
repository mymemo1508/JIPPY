package com.hbhw.jippy.domain.storeuser.controller.staff;

import com.hbhw.jippy.domain.storeuser.dto.request.staff.UpdateStaffRequest;
import com.hbhw.jippy.domain.storeuser.dto.response.staff.StaffEarnSalesResponse;
import com.hbhw.jippy.domain.storeuser.dto.response.staff.StaffResponse;
import com.hbhw.jippy.domain.storeuser.service.staff.StoreStaffService;
import com.hbhw.jippy.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/storeStaff")
@RequiredArgsConstructor
public class StoreStaffController {
    private final StoreStaffService storeStaffService;

    @Operation(summary = "매장 직원 목록 조회", description = "매장의 모든 직원 목록을 조회합니다")
    @GetMapping("/{storeId}/select")
    public ApiResponse<List<StaffResponse>> getStaffList(@PathVariable Integer storeId) {
        List<StaffResponse> response = storeStaffService.getStaffList(storeId);
        return ApiResponse.success(response);
    }

    @Operation(summary = "매장 직원 상세 조회", description = "각 매장 직원의 상세 정보를 조회합니다")
    @GetMapping("/{storeId}/select/{staffId}")
    public ApiResponse<StaffResponse> getStaff(@PathVariable Integer storeId, @PathVariable Integer staffId) {
        StaffResponse response = storeStaffService.getStaff(storeId, staffId);
        return ApiResponse.success(response);
    }

    @Operation(summary = "매장 직원 정보 수정", description = "각 매장 직원의 정보를 수정합니다")
    @PutMapping("/{storeId}/update/{staffId}")
    public ApiResponse<StaffResponse> updateStaff(@PathVariable Integer storeId, @PathVariable Integer staffId, @RequestBody UpdateStaffRequest request) {
        StaffResponse response = storeStaffService.updateStaff(storeId, staffId, request);
        return ApiResponse.success(response);
    }

    @Operation(summary = "매장 직원 삭제", description = "매장에서 직원을 삭제합니다.")
    @DeleteMapping("/{storeId}/delete/{staffId}")
    public ApiResponse<?> deleteStaff(@PathVariable Integer storeId, @PathVariable Integer staffId) {
        storeStaffService.deleteStaff(storeId, staffId);
        return ApiResponse.success(HttpStatus.NO_CONTENT);
    }

    @Operation(summary = "직원 별 매출 발생 통계", description = "매장별 직원 매출 통계를 조회합니다")
    @GetMapping("/staff/earn")
    public ApiResponse<?> fetchStaffEarnSales(@RequestParam("storeId") Integer storeId, @RequestParam("yearMonth") String yearMonth) {
        List<StaffEarnSalesResponse> responseList = storeStaffService.fetchStaffEarnSales(storeId, yearMonth);
        return ApiResponse.success(HttpStatus.OK,responseList);
    }

}
