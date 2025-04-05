package com.hbhw.jippy.domain.dashboard.dto.response.staff;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Schema(description = "직원 누적 근태 정보 응답")
@Getter
@Builder
public class TotalStaffStatusResponse {
    @Schema(description = "매장 직원 ID")
    private Integer staffId;

    @Schema(description = "누적 월 급여")
    private Integer totalSalary;

    @Schema(description = "누적 지각 횟수")
    private Integer totalLateCount;

    @Schema(description = "누적 조퇴 횟수")
    private Integer totalEarlyLeaveCount;

    @Schema(description = "누적 근무 시간 (분)")
    private Integer totalWorkMinutes;
}
