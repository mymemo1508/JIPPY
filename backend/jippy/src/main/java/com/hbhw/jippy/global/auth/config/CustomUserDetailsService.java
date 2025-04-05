package com.hbhw.jippy.global.auth.config;

import com.hbhw.jippy.domain.user.entity.UserOwner;
import com.hbhw.jippy.domain.user.entity.UserStaff;
import com.hbhw.jippy.domain.user.enums.StaffType;
import com.hbhw.jippy.domain.user.repository.UserOwnerRepository;
import com.hbhw.jippy.domain.user.repository.UserStaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * 사용자 정보를 로드하는 서비스
 * - Spring Security의 UserDetailsService 구현
 * - DB에서 사용자 정보를 조회하여 UserDetails 객체로 변환
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UserOwnerRepository userOwnerRepository;
    private final UserStaffRepository userStaffRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        /**
         * 점주 테이블에서 찾기
         */
        Optional<UserOwner> owner = userOwnerRepository.findByEmail(email);
        if (owner.isPresent()) {
            return new UserPrincipal(owner.get(), StaffType.OWNER);
        }

        /**
         * 직원 테이블에서 찾기
         */
        UserStaff staff = userStaffRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다."));

        /**
         * 직원 권한 찾기
         */
        return new UserPrincipal(staff, StaffType.STAFF);
    }
}
