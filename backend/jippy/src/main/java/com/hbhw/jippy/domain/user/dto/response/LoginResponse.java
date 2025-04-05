package com.hbhw.jippy.domain.user.dto.response;

import com.hbhw.jippy.domain.user.entity.BaseUser;
import com.hbhw.jippy.domain.user.enums.StaffType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Schema(description = "로그인 응답")
@Getter
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class LoginResponse {
    @Schema(description = "사용자 ID")
    private Integer id;

    @Schema(description = "사용자 이메일")
    private String email;

    @Schema(description = "사용자 이름")
    private String name;

    @Schema(description = "사용자 나이")
    private String age;

    @Schema(description = "사용자 유형(OWNER/MANAGER/STAFF)")
    private StaffType staffType;

    @Schema(description = "Access Token")
    private String accessToken;

    @Schema(description = "Refresh Token")
    private String refreshToken;

    public static LoginResponse of(BaseUser user, StaffType staffType, String accessToken, String refreshToken) {
        LoginResponseBuilder builder = LoginResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .age(user.getAge())
                .staffType(staffType)
                .accessToken(accessToken)
                .refreshToken(refreshToken);

        return builder.build();
    }
}
