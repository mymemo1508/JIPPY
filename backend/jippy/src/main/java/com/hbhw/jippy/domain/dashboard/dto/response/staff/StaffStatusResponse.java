package com.hbhw.jippy.domain.dashboard.dto.response.staff;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Schema(description = "직원 근태 정보 응답")
@Getter
@Builder
public class StaffStatusResponse {
    @Schema(description = "매장 직원 ID")
    private Integer staffId;

    @Schema(description = "해당 월 급여")
    private Integer salary;

    @Schema(description = "지각 횟수")
    private Integer lateCount;

    @Schema(description = "조퇴 횟수")
    private Integer earlyLeaveCount;

    @Schema(description = "총 근무 시간 (분)")
    private Integer workMinutes;
}
