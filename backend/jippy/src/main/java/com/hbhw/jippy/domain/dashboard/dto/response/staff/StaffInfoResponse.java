package com.hbhw.jippy.domain.dashboard.dto.response.staff;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Schema(description = "직원 정보 응답")
@Getter
@Builder
public class StaffInfoResponse {
    @Schema(description = "매장 직원 ID")
    private Integer staffId;

    @Schema(description = "직원 이름")
    private String name;
}
