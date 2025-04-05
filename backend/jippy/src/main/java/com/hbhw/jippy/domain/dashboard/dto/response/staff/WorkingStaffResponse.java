package com.hbhw.jippy.domain.dashboard.dto.response.staff;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Schema(description = "매장 현재 근무 현황 응답")
@Getter
@AllArgsConstructor
@Builder
public class WorkingStaffResponse {
    @Schema(description = "근무 중인 총 인원 수")
    private Integer totalCount;

    @Schema(description = "근무 중인 인원 목록")
    private List<StaffInfoResponse> staffList;
}
