package com.hbhw.jippy.domain.user.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hbhw.jippy.domain.store.entity.Store;
import com.hbhw.jippy.domain.store.repository.StoreRepository;
import com.hbhw.jippy.domain.storeuser.entity.staff.StoreUserStaff;
import com.hbhw.jippy.domain.storeuser.enums.StaffSalaryType;
import com.hbhw.jippy.domain.storeuser.repository.staff.StoreStaffRepository;
import com.hbhw.jippy.domain.user.dto.request.*;
import com.hbhw.jippy.domain.user.dto.response.LoginResponse;
import com.hbhw.jippy.domain.user.dto.response.UpdateUserResponse;
import com.hbhw.jippy.domain.user.dto.response.UserInfoResponse;
import com.hbhw.jippy.domain.user.entity.BaseUser;
import com.hbhw.jippy.domain.user.entity.UserOwner;
import com.hbhw.jippy.domain.user.entity.UserStaff;
import com.hbhw.jippy.domain.user.enums.StaffType;
import com.hbhw.jippy.domain.user.enums.UserType;
import com.hbhw.jippy.domain.user.factory.UserFactory;
import com.hbhw.jippy.domain.user.repository.UserOwnerRepository;
import com.hbhw.jippy.domain.user.repository.UserStaffRepository;
import com.hbhw.jippy.global.auth.config.JwtProvider;
import com.hbhw.jippy.global.auth.entity.RefreshToken;
import com.hbhw.jippy.global.auth.repository.RefreshTokenRepository;
import com.hbhw.jippy.global.auth.config.UserPrincipal;
import com.hbhw.jippy.global.code.CommonErrorCode;
import com.hbhw.jippy.global.error.BusinessException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserOwnerRepository userOwnerRepository;
    private final UserFactory userFactory;
    private final UserStaffRepository userStaffRepository;
    private final JwtProvider jwtProvider;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final RefreshTokenRepository refreshTokenRepository;
    private final StoreStaffRepository storeStaffRepository;
    private final StoreRepository storeRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${jwt.refresh.expiration}")
    private Long refreshTokenExpireTime;

    @Value("${jwt.access.expiration}")
    private Long accessTokenExpireTime;

    @Transactional
    public void ownerSignUp(OwnerSignUpRequest request) {
        if (userOwnerRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException(CommonErrorCode.INVALID_INPUT_VALUE, "이미 사용 중인 이메일입니다.");
        }

        BaseUser newUser = userFactory.createUser(request, UserType.OWNER);
        log.info("newUser {}", newUser);
        userOwnerRepository.save((UserOwner) newUser);
    }

    @Transactional
    public void staffSignUp(StaffSignUpRequest request) {
        if (userStaffRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException(CommonErrorCode.INVALID_INPUT_VALUE, "이미 사용 중인 이메일입니다.");
        }

        Store store = storeRepository.findById(request.getStoreId())
                .orElseThrow(() -> new BusinessException(CommonErrorCode.NOT_FOUND, "존재하지 않는 매장입니다."));

        BaseUser newUser = userFactory.createUser(request, UserType.STAFF);
        UserStaff savedUser = userStaffRepository.save((UserStaff) newUser);

        /**
         * 매장에 직원 등록
         */
        StoreUserStaff storeStaff = StoreUserStaff.builder()
                .userStaff(savedUser)
                .store(store)
                .staffType(StaffType.STAFF)
                .staffSalary(0)
                .staffSalaryType(StaffSalaryType.시급)
                .build();

        storeStaffRepository.save(storeStaff);
    }

    @Transactional
    public LoginResponse login(LoginRequest request, HttpServletResponse response) {

        BaseUser user = findUser(request.getEmail(), request.getUserType());
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException(CommonErrorCode.INVALID_INPUT_VALUE, "비밀번호가 일치하지 않습니다.");
        }

        StaffType staffType = getStaffType(user);
        UserPrincipal principal = new UserPrincipal(user, staffType);
        Authentication authentication = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String accessToken = jwtProvider.createAccessToken(authentication);
        String refreshToken = jwtProvider.createRefreshToken(user.getEmail());

        RefreshToken redisRefreshToken = RefreshToken.builder()
                .id(user.getEmail())
                .token(refreshToken)
                .staffType(staffType.name())
                .ttl(refreshTokenExpireTime / 1000)
                .build();

        refreshTokenRepository.save(redisRefreshToken);

        /**
         * redis 저장 확인용
         */
        RefreshToken savedToken = refreshTokenRepository.findById(redisRefreshToken.getId())
                .orElse(null);
        log.info("Redis에 저장된 값: " + savedToken);

        // storeId list 가져오기
        List<Integer> storeIdList = new ArrayList<>();
        if (StaffType.OWNER.name().equals(staffType.name())) {
            Optional<List<Store>> storeList = storeRepository.findByUserOwnerId(principal.getId());
            if (storeList.isPresent()) {
                for (Store store : storeList.get()) {
                    System.out.println(store.getId() + " " + store.getName());
                    storeIdList.add(store.getId());
                }
            }
        } else if (StaffType.STAFF.name().equals(staffType.name()) || StaffType.MANAGER.name().equals(staffType.name())) {
            log.info("staff");
            Optional<List<StoreUserStaff>> storeUserStaffOptional = storeStaffRepository.findAllByUserStaffId(principal.getId());
            if (storeUserStaffOptional.isPresent()) {
                for (StoreUserStaff storeUserStaff : storeUserStaffOptional.get()) {
                    System.out.println(storeUserStaff.getStore().getId());
                    storeIdList.add(storeUserStaff.getStore().getId());
                }
            }
        }

        // JWT 토큰과 사용자 정보를 쿠키에 저장
        setCookie(response, accessToken, refreshToken, principal, staffType, storeIdList);
        return LoginResponse.of(user, staffType, accessToken, refreshToken);
    }

    @Transactional
    public void logout() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        refreshTokenRepository.deleteById(principal.getEmail());
        SecurityContextHolder.clearContext();
    }

    @Transactional
    public void deleteUser() {
        BaseUser user = getCurrentUser();
        String deleteUserName = user.getName() + " (탈퇴)";
        user.updateInfo(deleteUserName, user.getAge());
        logout();
    }

    @Transactional
    public UpdateUserResponse updateUser(UpdateUserRequest request) {
        BaseUser user = getCurrentUser();
        user.updateInfo(request.getName(), request.getAge());
        return UpdateUserResponse.of(user);
    }

    @Transactional
    public void updatePassword(UpdatePasswordRequest request) {
        BaseUser user = getCurrentUser();
        user.updatePassword(passwordEncoder.encode(request.getNewPassword()));
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        BaseUser user = findUser(request.getEmail(), request.getUserType());
        String tempPassword = generateTempPassword();

        try {
            emailService.sendTempPassword(user.getName(), user.getEmail(), tempPassword);
            user.updatePassword(passwordEncoder.encode(tempPassword));
        } catch (Exception e) {
            throw new BusinessException(CommonErrorCode.INTERNAL_SERVER_ERROR, "이메일 발송 실패");
        }
    }

    @Transactional(readOnly = true)
    public UserInfoResponse getUserInfo() {
        BaseUser user = getCurrentUser();
        StaffType staffType = getStaffType(user);
        return UserInfoResponse.of(user, staffType);
    }

    /**
     * 사용자 조회 메서드
     */
    private BaseUser findUser(String email, UserType userType) {
        BaseUser user = switch (userType) {
            case OWNER -> userOwnerRepository.findByEmail(email)
                    .orElseThrow(() -> new BusinessException(CommonErrorCode.NOT_FOUND, "존재하지 않는 점주입니다."));
            case STAFF -> userStaffRepository.findByEmail(email)
                    .orElseThrow(() -> new BusinessException(CommonErrorCode.NOT_FOUND, "존재하지 않는 직원입니다."));
        };

        if (user.getName().contains("(탈퇴)")) {
            throw new BusinessException(CommonErrorCode.INVALID_INPUT_VALUE, "탈퇴한 회원입니다.");
        }

        return user;
    }

    /**
     * 현재 인증된 사용자 조회 메서드
     */
    private BaseUser getCurrentUser() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return switch (principal.getStaffType()) {
            case OWNER -> userOwnerRepository.findByEmail(principal.getEmail())
                    .orElseThrow(() -> new BusinessException(CommonErrorCode.NOT_FOUND, "존재하지 않는 점주입니다."));
            case STAFF, MANAGER -> userStaffRepository.findByEmail(principal.getEmail())
                    .orElseThrow(() -> new BusinessException(CommonErrorCode.NOT_FOUND, "존재하지 않는 직원입니다."));
        };
    }

    /**
     * 사용자 유형 조회 메서드
     */
    public StaffType getStaffType(BaseUser user) {
        if (user instanceof UserOwner owner) {
            return owner.getStaffType();
        }
        return StaffType.STAFF;
    }

    private String generateTempPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        StringBuilder sb = new StringBuilder();
        Random random = new Random();

        sb.append("A").append("a").append("1").append("!");

        for (int i = 0; i < 8; i++) {
            int index = random.nextInt(chars.length());
            sb.append(chars.charAt(index));
        }

        char[] password = sb.toString().toCharArray();
        for (int i = password.length - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);
            char temp = password[i];
            password[i] = password[j];
            password[j] = temp;
        }

        return new String(password);
    }

    private void setCookie(HttpServletResponse response, String accessToken, String refreshToken, UserPrincipal principal, StaffType staffType, List<Integer> storeIdList) {
        System.out.println(storeIdList);
        try {
            // 리스트를 JSON 문자열로 변환
            String jsonList = objectMapper.writeValueAsString(storeIdList);
            String encodedList = URLEncoder.encode(jsonList, StandardCharsets.UTF_8);
            String encodedUserName = URLEncoder.encode(principal.getName(), StandardCharsets.UTF_8);

            // ResponseCookie 생성
            addCookie(response, "storeIdList", encodedList, (int) (refreshTokenExpireTime / 1000));
            addCookie(response, "userId", principal.getId().toString(), (int) (refreshTokenExpireTime / 1000));
            addCookie(response, "staffType", staffType.name(), (int) (refreshTokenExpireTime / 1000));
            addCookie(response, "userName", encodedUserName, (int) (refreshTokenExpireTime / 1000));
            addCookie(response, "accessToken", accessToken, (int) (accessTokenExpireTime / 1000));
            addCookie(response, "refreshToken", refreshToken, (int) (refreshTokenExpireTime / 1000));
        } catch (Exception e) {
            e.printStackTrace();
            throw new BusinessException(CommonErrorCode.INTERNAL_SERVER_ERROR, "리스트 JSON 매핑 뱐환 오류");
        }
    }

    public static void addCookie(HttpServletResponse response, String name, String value, int maxAge) {
        Cookie cookie = new Cookie(name, value);
        cookie.setPath("/");
        cookie.setMaxAge(maxAge);
        cookie.setHttpOnly(false);
        response.addCookie(cookie);
    }
}