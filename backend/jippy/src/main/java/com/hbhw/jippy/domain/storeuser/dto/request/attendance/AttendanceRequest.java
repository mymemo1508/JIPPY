package com.hbhw.jippy.domain.storeuser.dto.request.attendance;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Schema(description = "출근 요청")
@Getter
@AllArgsConstructor
@Builder
public class AttendanceRequest {
    @Schema(description = "직원 아이디", example = "1")
    Integer staffId;

    @Schema(description = "위도", example = "35.12312424")
    String latitude;

    @Schema(description = "경도", example = "120.1231242")
    String longitude;
}
