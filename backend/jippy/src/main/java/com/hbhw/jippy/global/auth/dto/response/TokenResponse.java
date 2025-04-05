package com.hbhw.jippy.global.auth.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Schema(description = "Access Token 재발급 응답")
@Getter
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class TokenResponse {
    @Schema(description = "새로 발급된 Access Token")
    @JsonProperty("access_token")
    private String accessToken;

    public static TokenResponse of(String accessToken) {
        return new TokenResponse(accessToken);
    }
}
