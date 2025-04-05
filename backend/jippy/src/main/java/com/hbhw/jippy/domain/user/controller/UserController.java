package com.hbhw.jippy.domain.user.controller;

import com.hbhw.jippy.domain.user.dto.request.*;
import com.hbhw.jippy.domain.user.dto.response.LoginResponse;
import com.hbhw.jippy.domain.user.dto.response.UpdateUserResponse;
import com.hbhw.jippy.domain.user.dto.response.UserInfoResponse;
import com.hbhw.jippy.domain.user.enums.UserType;
import com.hbhw.jippy.domain.user.service.UserService;
import com.hbhw.jippy.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@Slf4j
@Tag(name = "User", description = "사용자 관리 API")
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @Operation(summary = "점주 회원가입", description = "점주 계정으로 회원가입을 진행합니다")
    @PostMapping("/signup/owner")
    public ApiResponse<?> ownerSignUp(@RequestBody @Valid OwnerSignUpRequest request) {
        log.info("sigeup-owner : {}", request);
        userService.ownerSignUp(request);
        return ApiResponse.success(HttpStatus.CREATED);
    }

    @Operation(summary = "직원 회원가입", description = "직원 계정으로 회원가입을 진행합니다")
    @PostMapping("/signup/staff")
    public ApiResponse<?> staffSignUp(@RequestBody @Valid StaffSignUpRequest request) {
        userService.staffSignUp(request);
        return ApiResponse.success(HttpStatus.CREATED);
    }

    @Operation(summary = "로그인", description = "사용자 로그인을 진행합니다")
    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@RequestBody @Valid LoginRequest request, HttpServletResponse httpServletResponse) {
        LoginResponse response = userService.login(request, httpServletResponse);

        return ApiResponse.success(response);
    }

    @Operation(summary = "로그아웃", description = "현재 로그인된 사용자를 로그아웃합니다")
    @PostMapping("/logout")
    public ApiResponse<?> logout() {
        userService.logout();
        return ApiResponse.success(HttpStatus.OK);
    }

    @Operation(summary = "회원 탈퇴", description = "현재 로그인된 사용자의 계정을 탈퇴시킵니다")
    @DeleteMapping("/delete")
    public ApiResponse<?> deleteUser() {
        userService.deleteUser();
        return ApiResponse.success(HttpStatus.NO_CONTENT);
    }

    @Operation(summary = "회원정보 수정", description = "사용자의 기본 정보를 수정합니다")
    @PutMapping("/update/userInfo")
    public ApiResponse<UpdateUserResponse> updateUser(@RequestBody @Valid UpdateUserRequest request) {
        UpdateUserResponse response = userService.updateUser(request);
        return ApiResponse.success(response);
    }

    @Operation(summary = "비밀번호 변경", description = "사용자의 비밀번호를 변경합니다")
    @PutMapping("/update/password")
    public ApiResponse<?> updatePassword(@RequestBody @Valid UpdatePasswordRequest request) {
        userService.updatePassword(request);
        return ApiResponse.success(HttpStatus.OK);
    }

    @Operation(summary = "비밀번호 재발급", description = "사용자의 비밀번호를 초기화합니다")
    @PostMapping("/reset/password")
    public ApiResponse<?> resetPassword(@RequestBody @Valid ResetPasswordRequest request) {
        userService.resetPassword(request);
        return ApiResponse.success(HttpStatus.OK);
    }

    @Operation(summary = "사용자 정보 조회", description = "현재 로그인한 사용자 정보를 조회합니다")
    @GetMapping("/select/userInfo")
    public ApiResponse<UserInfoResponse> getUserInfo() {
        UserInfoResponse response = userService.getUserInfo();
        return ApiResponse.success(response);
    }
}
