package com.hbhw.jippy.domain.storeuser.dto.request.attendance;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Schema(description = "임시 근무 스케줄 변경 요청")
@Getter
@AllArgsConstructor
@Builder
public class TempChangeRequest {

    @Schema(description = "uuid", example = "dwad-dwadgffd-28hb3j2")
    private String uuid;

    @Schema(description = "변경 날짜", example = "1990-01-02")
    private String newDate;

    @Schema(description = "변경 출근 시간", example = "13:00")
    private String newStartTime;

    @Schema(description = "변경 퇴근 시간", example = "17:00")
    private String newEndTime;
}
