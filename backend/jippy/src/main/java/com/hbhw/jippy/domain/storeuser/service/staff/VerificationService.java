package com.hbhw.jippy.domain.storeuser.service.staff;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class VerificationService {
    private final RedisTemplate<String, String> redisTemplate;
    private static final String KEY_PREFIX = "staff:verification:";
    @Value("${verification.ttl}")
    private Integer verificationTtl;

    public String createCode(String email) {
        String code = String.format("%06d", new Random().nextInt(1000000));

        String key = KEY_PREFIX + email;
        redisTemplate.opsForValue().set(key, code, Duration.ofSeconds(verificationTtl));

        return code;
    }

    public Boolean checkCode(String email, String code) {
        String key = KEY_PREFIX + email;
        String savedCode = redisTemplate.opsForValue().get(key);

        if (savedCode == null) {
            return false;
        }

        boolean isValid = savedCode.equals(code);
        if (isValid) {
            redisTemplate.delete(key);
        }
        return isValid;
    }
}
