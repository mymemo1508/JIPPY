package com.hbhw.jippy.domain.storeuser.controller.attendance;

import com.hbhw.jippy.domain.storeuser.dto.request.attendance.AttendanceRequest;
import com.hbhw.jippy.domain.storeuser.dto.request.attendance.ChangeScheduleRequest;
import com.hbhw.jippy.domain.storeuser.dto.request.attendance.TempChangeRequest;
import com.hbhw.jippy.domain.storeuser.dto.response.attendance.ChangeScheduleInfoResponse;
import com.hbhw.jippy.domain.storeuser.dto.response.attendance.CheckInResponse;
import com.hbhw.jippy.domain.storeuser.dto.response.attendance.CheckOutResponse;
import com.hbhw.jippy.domain.storeuser.dto.response.attendance.TempChangeResponse;
import com.hbhw.jippy.domain.storeuser.service.attendance.AttendanceService;
import com.hbhw.jippy.global.auth.config.UserPrincipal;
import com.hbhw.jippy.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Attendance", description = "직원 근태 관리 API")
@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {
    private final AttendanceService attendanceService;

    @Operation(summary = "직원 출근", description = "직원의 출근 기록을 등록합니다")
    @PostMapping("/{storeId}/checkIn")
    public ApiResponse<CheckInResponse> checkIn(@PathVariable Integer storeId, @RequestBody AttendanceRequest attendanceRequest, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        CheckInResponse response = attendanceService.checkIn(storeId, attendanceRequest);
        return ApiResponse.success(response);
    }

    @Operation(summary = "직원 퇴근", description = "직원의 퇴근 기록을 등록합니다")
    @PutMapping("/checkOut")
    public ApiResponse<CheckOutResponse> checkOut(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        CheckOutResponse response = attendanceService.checkOut(userPrincipal.getId());
        return ApiResponse.success(response);
    }

    @Operation(summary = "임시 스케줄 변경", description = "직원의 스케줄을 일시적으로 변경합니다")
    @PostMapping("/{storeId}/tempChange/{staffId}")
    public ApiResponse<TempChangeResponse> changeTempSchedule(@PathVariable Integer storeId, @PathVariable Integer staffId, @RequestBody TempChangeRequest request) {
        TempChangeResponse response = attendanceService.changeTempSchedule(storeId, staffId, request);
        return ApiResponse.success(response);
    }

    @Operation(summary = "임시 스케줄 변경 요청", description = "직원의 스케줄을 저장 합니다")
    @PostMapping("/{storeId}/tempChange/{staffId}/request")
    public ApiResponse<?> requestChangeSchedule(@RequestBody ChangeScheduleRequest changeScheduleRequest, @PathVariable Integer storeId, @PathVariable Integer staffId){
        attendanceService.addChangeSchedule(changeScheduleRequest, storeId, staffId);
        return ApiResponse.success(HttpStatus.OK);
    }

    @Operation(summary = "임시 스케줄 조회", description = "직원의 스케줄을 조회 합니다")
    @GetMapping("/{storeId}/tempChange/list")
    public ApiResponse<ChangeScheduleInfoResponse> fetchRequestSchedule(@PathVariable Integer storeId){
        ChangeScheduleInfoResponse response = ChangeScheduleInfoResponse.builder()
                .requestSchedule(attendanceService.fetchChangeSchedule(storeId))
                .build();
        return ApiResponse.success(HttpStatus.OK, response);
    }

}
