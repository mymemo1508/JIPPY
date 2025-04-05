package com.hbhw.jippy.utils;

import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class EnvironmentUtil {
    private static String env;

    @Value("${spring.profile.active:DEV}")
    public void setENV(String env) {
        EnvironmentUtil.env = env;

    }

    public static boolean isProduction() {
        log.info("ENV : {}", env);
        return "PROD".equalsIgnoreCase(env);
    }
}
