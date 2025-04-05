package com.hbhw.jippy.global.fcm;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FCMTokenRequest {
    private Integer userId;
    private String token;
    /**
     * userType: "owner" 또는 "staff"
     */
    private String userType;
}
