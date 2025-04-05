package com.hbhw.jippy.domain.user.dto.response;

import com.hbhw.jippy.domain.user.entity.BaseUser;
import com.hbhw.jippy.domain.user.enums.StaffType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Schema(description = "사용자 정보 응답")
@Getter
@AllArgsConstructor
@Builder
public class UserInfoResponse {
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

    @Schema(description = "가입 일시")
    private String createdAt;

    public static UserInfoResponse of(BaseUser user, StaffType staffType) {
        return UserInfoResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .age(user.getAge())
                .staffType(staffType)
                .createdAt(user.getCreatedAt())
                .build();
    }
}
