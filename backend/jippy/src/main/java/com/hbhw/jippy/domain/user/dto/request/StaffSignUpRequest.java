package com.hbhw.jippy.domain.user.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Schema(description = "직원 회원가입 요청")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StaffSignUpRequest extends OwnerSignUpRequest {
    @Schema(description = "등록할 매장 ID", example = "1")
    @NotNull(message = "매장 ID는 필수입니다.")
    private Integer storeId;
}
