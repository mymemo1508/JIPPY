package com.hbhw.jippy;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@ActiveProfiles("test")
@SpringBootTest
public class RedisTest {

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    @Test
    void redisConnectionTest() {
        String key = "test";
        String value = "hello";

        redisTemplate.opsForValue().set(key, value);

        String result = redisTemplate.opsForValue().get(key);
        assertThat(result).isEqualTo(value);
    }
}
