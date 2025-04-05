package com.hbhw.jippy.domain.storeuser.dto.request.staff;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

@Schema(description = "인증번호 확인 요청")
@Getter
public class CheckCodeRequest {
    @Schema(description = "입력한 이메일", example = "user@example.com")
    private String email;

    @Schema(description = "입력한 인증번호", example = "123456")
    private String code;
}
