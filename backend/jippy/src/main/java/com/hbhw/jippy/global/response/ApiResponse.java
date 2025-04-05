package com.hbhw.jippy.global.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ApiResponse<T> {
    private Integer code;
    private boolean success;
    private T data;

    private ApiResponse(T data) {
        this.code = 200;
        this.success = true;
        this.data = data;
    }

    private ApiResponse(HttpStatus status) {
        this.code = status.value();
        this.success = true;
    }

    private ApiResponse(HttpStatus status, T data) {
        this.code = status.value();
        this.success = true;
        this.data = data;
    }

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(data);
    }

    public static <T> ApiResponse<T> success(HttpStatus status) {
        return new ApiResponse<>(status);
    }

    public static <T> ApiResponse<T> success(HttpStatus status, T data) {
        return new ApiResponse<>(status, data);
    }
}
