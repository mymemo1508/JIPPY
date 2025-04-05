package com.hbhw.jippy.domain.storeuser.dto.response.attendance;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Schema(description = "임시 근무 스케줄 변경 응답")
@Getter
@AllArgsConstructor
@Builder
public class TempChangeResponse {
    @Schema(description = "매장 직원 ID")
    private Integer storeUserStaffId;

    @Schema(description = "변경된 날짜")
    private String newDate;

    @Schema(description = "변경된 출근 시간")
    private String newStartTime;

    @Schema(description = "변경된 퇴근 시간")
    private String newEndTime;
}
