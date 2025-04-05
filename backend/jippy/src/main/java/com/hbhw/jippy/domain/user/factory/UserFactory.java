package com.hbhw.jippy.domain.user.factory;

import com.hbhw.jippy.domain.user.dto.request.OwnerSignUpRequest;
import com.hbhw.jippy.domain.user.entity.BaseUser;
import com.hbhw.jippy.domain.user.entity.UserOwner;
import com.hbhw.jippy.domain.user.entity.UserStaff;
import com.hbhw.jippy.domain.user.enums.StaffType;
import com.hbhw.jippy.domain.user.enums.UserType;
import com.hbhw.jippy.utils.DateTimeUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserFactory {
    private final PasswordEncoder passwordEncoder;

    public BaseUser createUser(OwnerSignUpRequest request, UserType userType) {
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        return switch (userType) {
            case OWNER -> UserOwner.builder()
                    .email(request.getEmail())
                    .password(encodedPassword)
                    .name(request.getName())
                    .age(request.getAge())
                    .createdAt(DateTimeUtils.nowString())
                    .staffType(StaffType.OWNER)
                    .build();

            case STAFF -> UserStaff.builder()
                    .email(request.getEmail())
                    .password(encodedPassword)
                    .name(request.getName())
                    .age(request.getAge())
                    .build();
        };
    }
}
