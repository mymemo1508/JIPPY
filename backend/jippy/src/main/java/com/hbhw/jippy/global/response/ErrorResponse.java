package com.hbhw.jippy.global.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.hbhw.jippy.global.code.ErrorCode;
import com.hbhw.jippy.utils.EnvironmentUtil;
import jakarta.validation.ConstraintViolation;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.stream.Collectors;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ErrorResponse {

    private HttpStatus status;
    private String code;
    private String message;
    private boolean success;
    private List<CustomFieldError> errors;

    private ErrorResponse(ErrorCode errorCode, String errorMessage) {
        this.status = errorCode.getStatus();
        this.code = errorCode.getCode();
        this.message = errorMessage;
        this.success = false;
        this.errors = new ArrayList<>();
    }

    private ErrorResponse(ErrorCode errorCode, String errorMessage, List<CustomFieldError> errors) {
        this.status = errorCode.getStatus();
        this.code = errorCode.getCode();
        this.message = errorMessage;
        this.success = false;
        this.errors = errors;
    }

    // 입력받은 유효성 검사 @Vaild, @Validated 중 검증 실패시 발생
    public static ErrorResponse of(final ErrorCode errorCode, final BindingResult bindingResult) {
        return new ErrorResponse(errorCode, getSafeMessage(errorCode.getMessage()), CustomFieldError.of(bindingResult));
    }

    // NullPointer에러 처리 등 메세지와 에러 코드만 전달할때.
    public static ErrorResponse of(final ErrorCode errorCode, final String errorMessage) {
        return new ErrorResponse(errorCode, getSafeMessage(errorCode.getMessage()), CustomFieldError.of(errorMessage));
    }

    // ConstraintViolation 예외 처리
    public static ErrorResponse of(final ErrorCode errorCode, final Set<ConstraintViolation<?>> constraintViolations) {
        return new ErrorResponse(errorCode, getSafeMessage(errorCode.getMessage()), CustomFieldError.of(constraintViolations));
    }

    // 파라미터의 값이 입력이 안되어었을때 예외처리.
    public static ErrorResponse of(final ErrorCode errorCode, final MissingServletRequestParameterException missingServletRequestParameterException) {
        return new ErrorResponse(errorCode, getSafeMessage(errorCode.getMessage()), CustomFieldError.of(missingServletRequestParameterException));
    }

    public static ErrorResponse of(final ErrorCode errorCode, final NoSuchElementException noSuchElementException) {
        return new ErrorResponse(errorCode, getSafeMessage(errorCode.getMessage()), CustomFieldError.of(noSuchElementException));
    }

    // 파라미터로 전달된 값이 타입이 맞지 않을때 발생
    public static ErrorResponse of(final ErrorCode errorCode, final MethodArgumentTypeMismatchException methodArgumentTypeMismatchException) {
        return new ErrorResponse(errorCode, getSafeMessage(errorCode.getMessage()), CustomFieldError.of(methodArgumentTypeMismatchException));
    }

    // 10mb 이상 이미지가 업로드 될때 발생
    public static ErrorResponse of(final ErrorCode errorCode, final MaxUploadSizeExceededException maxUploadSizeExceededException) {
        return new ErrorResponse(errorCode, errorCode.getMessage() , CustomFieldError.of(maxUploadSizeExceededException.getMessage()));
    }

    public static ErrorResponse of(final ErrorCode errorCode, final NoResourceFoundException noResourceFoundException) {
        return new ErrorResponse(errorCode, getSafeMessage(errorCode.getMessage()), CustomFieldError.of(noResourceFoundException));
    }

    public static ErrorResponse of(final ErrorCode errorCode) {
        return new ErrorResponse(errorCode, getSafeMessage(errorCode.getMessage()));
    }

    public static ErrorResponse of(final ErrorCode errorCode, final List<CustomFieldError> errors) {
        return new ErrorResponse(errorCode, getSafeMessage(errorCode.getMessage()), errors);
    }

    private static String getSafeMessage(String devMessage) {
        return EnvironmentUtil.isProduction() ?
                "예기치 않은 오류가 발생했습니다. 다시 시도하거나, 에러 코드를 고객센터에 전달해 주세요." : devMessage;
    }

    @Getter
    @NoArgsConstructor(access = AccessLevel.PROTECTED)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class CustomFieldError {
        private String field;
        private String value;
        private String reason;
        private static final boolean isProd = EnvironmentUtil.isProduction();

        public CustomFieldError(String reason) {
            this.reason = reason;
        }

        public CustomFieldError(String field, String reason) {
            this.field = field;
            this.reason = reason;
        }

        public CustomFieldError(String field, String value, String reason) {
            this.field = field;
            this.value = value;
            this.reason = reason;
        }

        public static List<CustomFieldError> of(String field, String reason) {
            List<CustomFieldError> errorList = new ArrayList<>();
            errorList.add(new CustomFieldError(field, reason));
            return errorList;
        }

        public static List<CustomFieldError> of(String reason) {
            List<CustomFieldError> errorList = new ArrayList<>();
            errorList.add(new CustomFieldError(reason));
            return errorList;
        }

        public static List<CustomFieldError> of(String field, String value, String reason) {
            List<CustomFieldError> errorList = new ArrayList<>();
            errorList.add(new CustomFieldError(field, value, reason));
            return errorList;
        }

        // @Valid, @Validated 으로 필드에 대한 검증결과 응답
        public static List<CustomFieldError> of(BindingResult bindingResult) {
            if (isProd) {
                return safeMessageProvider();
            }
            return bindingResult.getFieldErrors().stream()
                    .map(error -> new CustomFieldError(
                            error.getField(),
                            error.getRejectedValue().toString(),
                            error.getDefaultMessage()
                    )).collect(Collectors.toList());
        }

        // 객체에 대한 검증결과 응답
        public static List<CustomFieldError> of(Set<ConstraintViolation<?>> constraintViolation) {
            if (isProd) {
                return safeMessageProvider();
            }
            return constraintViolation.stream()
                    .map(error -> new CustomFieldError(
                            error.getPropertyPath().toString(),
                            error.getMessage()
                    )).collect(Collectors.toList());
        }

        // 메서드 파라미터타입이 기대한 타입과 다를때 발생
        public static List<CustomFieldError> of(final MethodArgumentTypeMismatchException e) {
            if (isProd) {
                return safeMessageProvider();
            }
            return CustomFieldError.of(e.getName(), e.getValue().toString(), e.getErrorCode());
        }

        // URL에 쿼리 파라미터 누락시 발생
        public static List<CustomFieldError> of(final MissingServletRequestParameterException e) {
            if (isProd) {
                return safeMessageProvider();
            }
            return CustomFieldError.of(e.getParameterName(), e.getMessage());
        }

        // PathVariable 누락및 엔드포인트 존재하지 않을때 발생
        public static List<CustomFieldError> of(final NoResourceFoundException e){
            if (isProd) {
                return safeMessageProvider();
            }
            return CustomFieldError.of(e.getResourcePath(), e.getMessage());
        }

        // 존재하지않는 리소스를 조회했을때
        public static List<CustomFieldError> of(final NoSuchElementException e){
            if (isProd) {
                return safeMessageProvider();
            }
            return CustomFieldError.of(e.getMessage());
        }

        private static List<CustomFieldError> safeMessageProvider(){
            return CustomFieldError.of("잠시후 다시 시도해 주세요");
        }
    }
}
