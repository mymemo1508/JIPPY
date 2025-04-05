package com.hbhw.jippy.domain.user.dto.response;

import com.hbhw.jippy.domain.user.entity.BaseUser;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Schema(description = "사용자 정보 수정 응답")
@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class UpdateUserResponse {
    @Schema(description = "수정된 사용자 이름")
    private String name;

    @Schema(description = "수정된 생년월일")
    private String age;

    public static UpdateUserResponse of(BaseUser user) {
        return UpdateUserResponse.builder()
                .name(user.getName())
                .age(user.getAge())
                .build();
    }
}
