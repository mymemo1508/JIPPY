package com.hbhw.jippy.domain.qrcode.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Schema(description = "QR 생성 요청")
@Getter
@AllArgsConstructor
public class CreateQrRequest {
    @Schema(description = "QR 설명", example = "고객 피드백용")
    private String explain;

    @Schema(description = "이동할 경로", example = "https://www.example.com")
    private String url;
}
