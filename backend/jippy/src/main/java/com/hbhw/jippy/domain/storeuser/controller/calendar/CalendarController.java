package com.hbhw.jippy.domain.storeuser.controller.calendar;

import com.hbhw.jippy.domain.storeuser.dto.request.calendar.DayScheduleRequest;
import com.hbhw.jippy.domain.storeuser.dto.request.calendar.WeekScheduleRequest;
import com.hbhw.jippy.domain.storeuser.dto.response.calendar.ScheduleResponse;
import com.hbhw.jippy.domain.storeuser.dto.response.calendar.StaffScheduleResponse;
import com.hbhw.jippy.domain.storeuser.service.calendar.CalendarService;
import com.hbhw.jippy.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Calendar", description = "캘린더 관리 API")
@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CalendarController {
    private final CalendarService calendarService;

    @Operation(summary = "스케줄 등록", description = "점주가 각 직원의 스케줄을 등록합니다")
    @PostMapping("/{storeId}/create/{staffId}")
    public ApiResponse<?> createSchedule(@PathVariable Integer storeId, @PathVariable Integer staffId, @RequestBody WeekScheduleRequest request) {
        calendarService.createSchedule(storeId, staffId, request);
        return ApiResponse.success(HttpStatus.CREATED);
    }

    @Operation(summary = "전체 스케줄 조회", description = "매장 전체 직원의 스케줄을 조회합니다")
    @GetMapping("/{storeId}/select")
    public ApiResponse<List<StaffScheduleResponse>> getScheduleList(@PathVariable Integer storeId) {
        List<StaffScheduleResponse> response = calendarService.getScheduleList(storeId);
        return ApiResponse.success(response);
    }

    @Operation(summary = "상세 스케줄 조회", description = "매장 각 직원의 스케줄을 조회합니다")
    @GetMapping("/{storeId}/select/{staffId}")
    public ApiResponse<StaffScheduleResponse> getSchedule(@PathVariable Integer storeId, @PathVariable Integer staffId) {
        StaffScheduleResponse response = calendarService.getSchedule(storeId, staffId);
        return ApiResponse.success(response);
    }

    @Operation(summary = "스케줄 수정", description = "각 직원의 스케줄을 수정합니다")
    @PutMapping("/{storeId}/update/{calendarId}")
    public ApiResponse<ScheduleResponse> updateSchedule(@PathVariable Integer storeId, @PathVariable Integer calendarId, @RequestBody DayScheduleRequest request) {
        ScheduleResponse response = calendarService.updateSchedule(storeId, calendarId, request);
        return ApiResponse.success(response);
    }

    @Operation(summary = "스케줄 삭제", description = "각 직원의 스케줄을 삭제합니다")
    @DeleteMapping("/{storeId}/delete/{calendarId}")
    public ApiResponse<?> deleteSchedule(@PathVariable Integer storeId, @PathVariable Integer calendarId) {
        calendarService.deleteSchedule(storeId, calendarId);
        return ApiResponse.success(HttpStatus.NO_CONTENT);
    }
}
