package com.hbhw.jippy.domain.storeuser.controller.staff;

import com.hbhw.jippy.domain.storeuser.dto.request.staff.CheckCodeRequest;
import com.hbhw.jippy.domain.storeuser.dto.request.staff.CreateCodeRequest;
import com.hbhw.jippy.domain.storeuser.service.staff.VerificationService;
import com.hbhw.jippy.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Staff Verification", description = "직원 등록 인증번호 관리 API")
@RestController
@RequestMapping("/api/verification")
@RequiredArgsConstructor
public class VerificationController {
    private final VerificationService verificationService;

    @Operation(summary = "인증번호 발급", description = "6자리 인증번호를 발급합니다")
    @PostMapping("/create")
    public ApiResponse<String> createCode(@RequestBody CreateCodeRequest request) {
        String code = verificationService.createCode(request.getEmail());
        return ApiResponse.success(code);
    }

    @Operation(summary = "인증번호 확인", description = "입력 받은 인증번호의 유효성을 검증합니다")
    @PostMapping("/check")
    public ApiResponse<Boolean> checkCode(@RequestBody CheckCodeRequest request) {
        Boolean isValid = verificationService.checkCode(request.getEmail(), request.getCode());
        return ApiResponse.success(isValid);
    }
}
