package com.hbhw.jippy.config;

import com.hbhw.jippy.utils.WebRTCUtil;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class WebRTCConfig {
    @Bean
    public WebRTCUtil webRTCUtil() {
        return new WebRTCUtil();
    }
}
