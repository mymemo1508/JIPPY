package com.hbhw.jippy.domain.storeuser.dto.request.staff;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

@Schema(description = "인증번호 발급 요청")
@Getter
public class CreateCodeRequest {
    @Schema(description = "입력한 이메일", example = "user@example.com")
    private String email;
}
