package com.hbhw.jippy.domain.dashboard.dto.response.staff;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Schema(description = "매장 총 인건비 응답")
@Getter
@Builder
public class StoreSalaryResponse {
    @Schema(description = "해당 월 총 인건비")
    private Integer storeSalary;
}
