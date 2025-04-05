package com.hbhw.jippy.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springdoc.core.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI configOpenApi(){
        return new OpenAPI()
                .info(new Info()
                        .title("JIPPY API Document")
                        .description("JIPPY API 문서입니다.")
                        .version("api/v1")
                );
    }

    @Bean
    public GroupedOpenApi productAph(){
        return GroupedOpenApi.builder()
                .group("상품 - product")
                .pathsToMatch("/api/product/**")
                .build();
    }

    @Bean
    public GroupedOpenApi cashApi() {
        return GroupedOpenApi.builder()
                .group("시재 - cash")
                .pathsToMatch("/api/cash/**")
                .build();
    }

    @Bean
    public GroupedOpenApi userApi() {
        return GroupedOpenApi.builder()
                .group("사용자 - user")
                .pathsToMatch("/api/user/**")
                .build();
    }

    @Bean
    public GroupedOpenApi authApi() {
        return GroupedOpenApi.builder()
                .group("인증 - auth")
                .pathsToMatch("/api/auth/**")
                .build();
    }

    @Bean
    public GroupedOpenApi recipeApi() {
        return GroupedOpenApi.builder()
                .group("레시피 - recipe")
                .pathsToMatch("/api/recipe/**")
                .build();
    }

    public GroupedOpenApi qrApi() {
        return GroupedOpenApi.builder()
                .group("QR 코드 - qr")
                .pathsToMatch("/api/qr/**")
                .build();
    }
}
