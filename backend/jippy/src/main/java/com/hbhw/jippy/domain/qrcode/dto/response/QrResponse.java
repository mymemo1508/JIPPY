package com.hbhw.jippy.domain.qrcode.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.hbhw.jippy.domain.qrcode.entity.QrCode;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Schema(description = "QR 정보 응답")
@Getter
@Builder
public class QrResponse {
    @Schema(description = "QR ID")
    private Long id;

    @Schema(description = "QR 설명")
    private String explain;

    @Schema(description = "QR 생성 일시")
    private String createdAt;

    public static QrResponse of(QrCode qrCode) {
        return QrResponse.builder()
                .id(qrCode.getId())
                .explain(qrCode.getExplain())
                .createdAt(qrCode.getCreatedAt())
                .build();
    }
}
