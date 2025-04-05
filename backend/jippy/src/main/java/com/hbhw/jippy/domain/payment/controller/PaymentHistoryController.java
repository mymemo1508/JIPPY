package com.hbhw.jippy.domain.payment.controller;


import com.hbhw.jippy.domain.payment.dto.request.PaymentUUIDRequest;
import com.hbhw.jippy.domain.payment.dto.response.*;
import com.hbhw.jippy.domain.payment.entity.BuyProduct;
import com.hbhw.jippy.domain.payment.entity.PaymentHistory;
import com.hbhw.jippy.domain.payment.enums.PaymentStatus;
import com.hbhw.jippy.domain.payment.enums.PaymentType;
import com.hbhw.jippy.domain.payment.service.PaymentHistoryService;
import com.hbhw.jippy.global.pagination.dto.request.PaginationRequest;
import com.hbhw.jippy.global.pagination.dto.response.PaginationResponse;
import com.hbhw.jippy.global.response.ApiResponse;
import com.hbhw.jippy.utils.DateTimeUtils;
import com.hbhw.jippy.utils.UUIDProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/payment-history")
public class PaymentHistoryController {

    private final PaymentHistoryService paymentHistoryService;
    private final UUIDProvider uuidProvider;

    @GetMapping("/list")
    public ApiResponse<List<PaymentHistoryListResponse>> getAllPaymentHistory(@RequestParam("storeId") Integer storeId) {
        List<PaymentHistoryListResponse> paymentHistoryListResponses = paymentHistoryService.getPaymentHistoryList(storeId);
        return ApiResponse.success(HttpStatus.OK, paymentHistoryListResponses);
    }

    @GetMapping("/fetch")
    public ApiResponse<PaginationResponse<PaymentHistoryListResponse>> fetchPaymentHistory(@RequestBody PaginationRequest paginationRequest,  @RequestParam("storeId") Integer storeId) {
        PaginationResponse<PaymentHistoryListResponse> pageResponse = PaginationResponse.of(paymentHistoryService.fetchPaymentHistoryList(paginationRequest, storeId), paginationRequest);
        return ApiResponse.success(HttpStatus.OK, pageResponse);
    }

    @PutMapping("/change/status")
    public ApiResponse<?> changeStatusPaymentHistory(@RequestBody PaymentUUIDRequest paymentUUIDRequest) {
        paymentHistoryService.changeStatusPaymentHistory(paymentUUIDRequest);
        return ApiResponse.success(HttpStatus.OK);
    }

    @PutMapping("/change/type")
    public ApiResponse<?> changeTypePaymentHistory(@RequestBody PaymentUUIDRequest paymentUUIDRequest) {
        paymentHistoryService.changeTypePaymentHistory(paymentUUIDRequest);
        return ApiResponse.success(HttpStatus.OK);
    }

    @PostMapping("/detail")
    public ApiResponse<PaymentDetailResponse> getDetailPaymentHistory(@RequestBody PaymentUUIDRequest paymentUUIDRequest) {
        PaymentDetailResponse paymentDetailResponse = paymentHistoryService.selectDetailPaymentHistory(paymentUUIDRequest);
        return ApiResponse.success(HttpStatus.OK, paymentDetailResponse);
    }

    @GetMapping("/list/success")
    public ApiResponse<List<PaymentHistoryListResponse>> getSuccessHistoryList(@RequestParam("storeId") Integer storeId) {
        List<PaymentHistoryListResponse> paymentHistoryListResponses = paymentHistoryService.getSuccessHistoryList(storeId);
        return ApiResponse.success(HttpStatus.OK, paymentHistoryListResponses);
    }

    @GetMapping("/list/cancel")
    public ApiResponse<List<PaymentHistoryListResponse>> getCancelHistoryList(@RequestParam("storeId") Integer storeId) {
        List<PaymentHistoryListResponse> paymentHistoryListResponses = paymentHistoryService.getCancelHistoryList(storeId);
        return ApiResponse.success(HttpStatus.OK, paymentHistoryListResponses);
    }

    @GetMapping("/sales/day")
    public ApiResponse<SalesByDayResponse> fetchSalesByDay(@RequestParam("storeId") Integer storeId, @RequestParam("startDate") String startDate, @RequestParam("endDate") String endDate ) {
        SalesByDayResponse salesByDayResponse = paymentHistoryService.fetchSalesByDay(storeId, startDate, endDate);
        return ApiResponse.success(HttpStatus.OK, salesByDayResponse);
    }

    @GetMapping("/sales/week")
    public ApiResponse<SalesByWeekResponse> fetchSalesByWeek(@RequestParam("storeId") Integer storeId, @RequestParam("startDate") String startDate, @RequestParam("endDate") String endDate ) {
        SalesByWeekResponse salesByWeekResponse = paymentHistoryService.fetchSalesByWeek(storeId, startDate, endDate);
        return ApiResponse.success(HttpStatus.OK, salesByWeekResponse);
    }

    @GetMapping("/sales/month")
    public ApiResponse<SalesByMonthResponse> fetchSalesByMonth(@RequestParam("storeId") Integer storeId, @RequestParam("startDate") String startDate, @RequestParam("endDate") String endDate ) {
        SalesByMonthResponse salesByMonthResponse = paymentHistoryService.fetchSalesByMonth(storeId, startDate, endDate);
        return ApiResponse.success(HttpStatus.OK, salesByMonthResponse);
    }
}
