package com.hbhw.jippy.domain.qrcode.controller;

import com.hbhw.jippy.domain.qrcode.dto.request.CreateQrRequest;
import com.hbhw.jippy.domain.qrcode.dto.response.QrResponse;
import com.hbhw.jippy.domain.qrcode.service.QrService;
import com.hbhw.jippy.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "QR", description = "QR 관리 API")
@RestController
@RequestMapping("/api/qr")
@RequiredArgsConstructor
public class QrController {
    private final QrService qrService;

    @Operation(summary = "QR 생성", description = "QR을 생성합니다")
    @PostMapping("/{storeId}/create")
    public ResponseEntity<byte[]> createQr(@PathVariable Integer storeId, @RequestBody CreateQrRequest request) {
        byte[] qrImage = qrService.createQr(storeId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .contentType(MediaType.IMAGE_PNG)
                .body(qrImage);
    }

    @Operation(summary = "전체 QR 목록 조회", description = "매장의 전체 QR 목록을 조회합니다")
    @GetMapping("/{storeId}/select")
    public ApiResponse<List<QrResponse>> getQrList(@PathVariable Integer storeId) {
        List<QrResponse> response = qrService.getQrList(storeId);
        return ApiResponse.success(response);
    }

    @Operation(summary = "QR 상세 조회", description = "각 QR을 조회합니다")
    @GetMapping("/{storeId}/select/{qrId}")
    public ApiResponse<QrResponse> getQr(@PathVariable Integer storeId, @PathVariable Long qrId) {
        QrResponse response = qrService.getQr(storeId, qrId);
        return ApiResponse.success(response);
    }

    @Operation(summary = "QR 삭제", description = "QR을 삭제합니다")
    @DeleteMapping("/{storeId}/delete/{qrId}")
    public ApiResponse<Void> deleteQr(@PathVariable Integer storeId, @PathVariable Long qrId) {
        qrService.deleteQr(storeId, qrId);
        return ApiResponse.success(HttpStatus.NO_CONTENT);
    }
}
