package com.hbhw.jippy.domain.dashboard.controller.staff;

import com.hbhw.jippy.domain.dashboard.dto.response.staff.*;
import com.hbhw.jippy.domain.dashboard.service.staff.StaffDashboardService;
import com.hbhw.jippy.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Dashboard - Staff", description = "인적 관리 대시보드 API")
@RestController
@RequestMapping("/api/dashboard/staff")
@RequiredArgsConstructor
@Validated
public class StaffDashboardController {
    private final StaffDashboardService dashboardService;

    @Operation(summary = "매장 현재 근무 현황", description = "현재 근무 중인 직원 목록을 조회합니다")
    @GetMapping("/{storeId}/working")
    public ApiResponse<WorkingStaffResponse> getWorkingStaff(
            @Parameter(description = "매장 ID")
            @PathVariable Integer storeId) {
        WorkingStaffResponse response = dashboardService.getWorkingStaff(storeId);
        return ApiResponse.success(response);
    }

    @Operation(summary = "직원 근태 정보 조회", description = "직원의 특정 월 근태 정보를 조회합니다")
    @GetMapping("/{storeId}/status/{staffId}")
    public ApiResponse<StaffStatusResponse> getStaffStatus(
            @Parameter(description = "매장 ID")
            @PathVariable Integer storeId,
            @Parameter(description = "매장 직원 ID")
            @PathVariable Integer staffId,
            @RequestParam @Pattern(regexp = "\\d{4}-\\d{2}", message = "yyyy-MM 형식으로 입력해주세요.") String date) {
        StaffStatusResponse response = dashboardService.getStaffStatus(storeId, staffId, date);
        return ApiResponse.success(response);
    }

    @Operation(summary = "직원 누적 근태 정보 조회", description = "직원의 근무 기간동안의 근태 정보를 조회합니다")
    @GetMapping("/{storeId}/totalStatus/{staffId}")
    public ApiResponse<TotalStaffStatusResponse> getTotalStaffStatus(
            @Parameter(description = "매장 ID")
            @PathVariable Integer storeId,
            @Parameter(description = "매장 직원 ID")
            @PathVariable Integer staffId) {
        TotalStaffStatusResponse response = dashboardService.getTotalStaffStatus(storeId, staffId);
        return ApiResponse.success(response);
    }

    @Operation(summary = "매장 인건비 조회", description = "매장의 특정 월 인건비를 조회합니다")
    @GetMapping("/{storeId}/storeSalary")
    public ApiResponse<StoreSalaryResponse> getStoreSalary(
            @Parameter(description = "매장 ID")
            @PathVariable Integer storeId,
            @RequestParam @Pattern(regexp = "\\d{4}-\\d{2}", message = "yyyy-MM 형식으로 입력해주세요.") String date) {
        StoreSalaryResponse response = dashboardService.getStoreSalary(storeId, date);
        return ApiResponse.success(response);
    }

    @Operation(summary = "매장 누적 인건비 조회", description = "매장의 영업 기간동안의 인건비를 조회합니다")
    @GetMapping("/{storeId}/totalStoreSalary")
    public ApiResponse<TotalStoreSalaryResponse> getTotalStoreSalary(
            @Parameter(description = "매장 ID")
            @PathVariable Integer storeId) {
        TotalStoreSalaryResponse response = dashboardService.getTotalStoreSalary(storeId);
        return ApiResponse.success(response);
    }
}
