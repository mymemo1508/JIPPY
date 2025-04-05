package com.hbhw.jippy.global.auth.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.TimeToLive;

@Getter
@Builder
@AllArgsConstructor
@ToString
@RedisHash("refreshToken")
public class RefreshToken {
    @Id
    private String id;
    private String token;
    private String staffType;

    @TimeToLive
    private Long ttl;
}
