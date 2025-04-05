package com.hbhw.jippy.global.auth.controller;

import com.hbhw.jippy.global.auth.dto.response.TokenResponse;
import com.hbhw.jippy.global.auth.config.CustomUserDetailsService;
import com.hbhw.jippy.global.auth.config.JwtProvider;
import com.hbhw.jippy.global.auth.entity.RefreshToken;
import com.hbhw.jippy.global.auth.repository.RefreshTokenRepository;
import com.hbhw.jippy.global.response.ApiResponse;
import io.jsonwebtoken.Claims;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Auth", description = "토큰 관리 API")
@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class TokenController {
    private final JwtProvider jwtProvider;
    private final RefreshTokenRepository refreshTokenRepository;
    private final CustomUserDetailsService userDetailsService;

    @Operation(summary = "Access Token 재발급", description = "유효한 Refresh Token을 통해 새로운 Access Token을 발급합니다")
    @PostMapping("/refresh")
    public ApiResponse<TokenResponse> refresh(@RequestHeader("Authorization") String refreshToken) {
        refreshToken = refreshToken.substring(7);
        log.info("Refresh Token: {}", refreshToken);

        try {
            Claims claims = jwtProvider.validateTokenAndGetClaims(refreshToken);
            log.info("토큰 검증 완료");

            RefreshToken redisRefreshToken = refreshTokenRepository.findById(claims.getSubject())
                    .orElseThrow(() -> new RuntimeException("저장된 Refresh Token이 없습니다."));
            log.info("Redis Refresh Token: {}", redisRefreshToken);

            if (!redisRefreshToken.getToken().equals(refreshToken)) {
                throw new RuntimeException("Refresh Token이 일치하지 않습니다.");
            }

            UserDetails userDetails = userDetailsService.loadUserByUsername(redisRefreshToken.getId());
            Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

            String newAccessToken = jwtProvider.createAccessToken(authentication);

            return ApiResponse.success(TokenResponse.of(newAccessToken));
        } catch (Exception e) {
            throw new RuntimeException("토큰 갱신 실패: " + e.getMessage());
        }
    }
}
