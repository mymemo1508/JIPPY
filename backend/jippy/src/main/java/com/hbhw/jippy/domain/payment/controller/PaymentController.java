package com.hbhw.jippy.domain.payment.controller;

import com.hbhw.jippy.domain.payment.dto.request.CancelCashPaymentRequest;
import com.hbhw.jippy.domain.payment.dto.request.ConfirmCashPaymentRequest;
import com.hbhw.jippy.domain.payment.dto.request.ConfirmQrCodePaymentRequest;
import com.hbhw.jippy.domain.payment.dto.request.PaymentUUIDRequest;
import com.hbhw.jippy.domain.payment.service.PaymentService;
import com.hbhw.jippy.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("api/payment")
public class PaymentController {
    private final PaymentService paymentService;

    @Operation(summary = "현금 결제", description = "상품을 현금결제 합니다.")
    @PostMapping("/cash/confirm")
    public ApiResponse<?> confirmCashPayment(@RequestBody ConfirmCashPaymentRequest confirmCashPaymentRequest) {
        log.info("Cash Payment Activate");
        paymentService.cashPaymentConfirm(confirmCashPaymentRequest);
        return ApiResponse.success(HttpStatus.CREATED);
    }

    @Operation(summary = "QrCode 결제", description = "상품을 QR코드 결제 합니다")
    @PostMapping("/qrcode/confirm")
    public ApiResponse<?> confirmQrCodePayment(@RequestBody ConfirmQrCodePaymentRequest confirmQrCodePaymentRequest) {
        log.info("QrCode Payment Activate");
        paymentService.qrCodePaymentConfirm(confirmQrCodePaymentRequest);
        return ApiResponse.success(HttpStatus.CREATED);
    }

    @Operation(summary = "QrCode 결제 취소", description = "QR결제를 취소합니다")
    @PostMapping("/qrcode/cancel")
    public ApiResponse<?> cancelPayment(@RequestBody PaymentUUIDRequest paymentUUIDRequest) {
        paymentService.cancelQrCodePayment(paymentUUIDRequest);
        return ApiResponse.success(HttpStatus.CREATED);
    }

    @Operation(summary = "현금 결제 취소", description = "현금결제를 취소합니다")
    @PostMapping("/cash/cancel")
    public ApiResponse<?> cancelPayment(@RequestBody CancelCashPaymentRequest cancelCashPaymentRequest) {
        paymentService.cancelCashPayment(cancelCashPaymentRequest);
        return ApiResponse.success(HttpStatus.CREATED);
    }
}
