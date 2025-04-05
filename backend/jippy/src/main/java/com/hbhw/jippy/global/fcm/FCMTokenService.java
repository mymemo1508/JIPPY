package com.hbhw.jippy.global.fcm;

import com.hbhw.jippy.domain.user.entity.UserOwner;
import com.hbhw.jippy.domain.user.entity.UserStaff;
import com.hbhw.jippy.domain.user.repository.UserOwnerRepository;
import com.hbhw.jippy.domain.user.repository.UserStaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FCMTokenService {

    private final UserOwnerRepository userOwnerRepository;
    private final UserStaffRepository userStaffRepository;

    /**
     * 전달받은 FCMTokenRequest에 따라 해당 사용자의 fcmToken을 업데이트합니다.
     *
     * @param request FCMTokenRequest (userId, token, userType)
     */
    public void updateToken(FCMTokenRequest request) {
        String userType = request.getUserType();
        if ("owner".equalsIgnoreCase(userType)) {
            UserOwner owner = userOwnerRepository.findById(request.getUserId())
                    .orElseThrow(() -> new RuntimeException("해당 사장님이 존재하지 않습니다 : " + request.getUserId()));
            owner.updateFcmToken(request.getToken());
            userOwnerRepository.save(owner);
        } else if ("staff".equalsIgnoreCase(userType)) {
            UserStaff staff = userStaffRepository.findById(request.getUserId())
                    .orElseThrow(() -> new RuntimeException("해당 직원이 존재하지 않습니다 : " + request.getUserId()));
            staff.updateFcmToken(request.getToken());
            userStaffRepository.save(staff);
        } else {
            throw new RuntimeException("Invalid user type: " + userType);
        }
    }
}
