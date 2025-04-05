package com.hbhw.jippy.domain.payment.service;

import com.hbhw.jippy.domain.payment.dto.ProductTotalSold;
import com.hbhw.jippy.domain.payment.dto.request.PaymentUUIDRequest;
import com.hbhw.jippy.domain.payment.dto.response.*;
import com.hbhw.jippy.domain.payment.entity.BuyProduct;
import com.hbhw.jippy.domain.payment.entity.PaymentHistory;
import com.hbhw.jippy.domain.payment.enums.PaymentStatus;
import com.hbhw.jippy.domain.payment.enums.PaymentType;
import com.hbhw.jippy.domain.payment.mapper.PaymentMapper;
import com.hbhw.jippy.domain.payment.repository.PaymentHistoryCustomRepository;
import com.hbhw.jippy.domain.payment.repository.PaymentHistoryRepository;
import com.hbhw.jippy.domain.product.dto.response.ProductSoldCountResponse;
import com.hbhw.jippy.global.code.CommonErrorCode;
import com.hbhw.jippy.global.error.BusinessException;
import com.hbhw.jippy.global.pagination.dto.request.PaginationRequest;
import com.hbhw.jippy.global.pagination.dto.response.PaginationResponse;
import com.hbhw.jippy.utils.DateTimeUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentHistoryService {

    private final PaymentHistoryRepository paymentHistoryRepository;
    private final PaymentHistoryCustomRepository paymentHistoryCustomRepository;

    /**
     * 결재내역 저장
     */
    public void savePaymentHistory(PaymentHistory paymentHistory) {
        paymentHistoryRepository.save(paymentHistory);
    }

    /**
     * 결제내역 전체 리스트 조회
     */
    public List<PaymentHistoryListResponse> getPaymentHistoryList(Integer storeId) {
        List<PaymentHistory> paymentHistoryEntity = paymentHistoryRepository
                .findByStoreId(storeId, Sort.by(Sort.Direction.DESC, "createdAt"));

        return paymentHistoryEntity.stream()
                .map(PaymentMapper::convertPaymentHistoryListResponse)
                .toList();
    }

    /**
     * 결제내역 전체 리스트 페이징 조회
     */
    public Page<PaymentHistoryListResponse> fetchPaymentHistoryList(PaginationRequest paginationRequest, Integer storeId) {
        Pageable pageable = paginationRequest.toPageable();
        Page<PaymentHistory> paymentHistoryEntity = paymentHistoryRepository.findByStoreId(storeId, paginationRequest.getStartDate(), paginationRequest.getEndDate(),  pageable);
        return paymentHistoryEntity.map(PaymentMapper::convertPaymentHistoryListResponse);
    }

    /**
     * 결제내역 상태 변경
     */
    public void changeStatusPaymentHistory(PaymentUUIDRequest paymentUUIDRequest) {
        PaymentHistory paymentHistoryEntity = getPaymentHistory(paymentUUIDRequest.getPaymentUUID());
        // 상태 변경 : 구매 -> 취소, 취소 -> 구매
        String changedStatus = paymentHistoryEntity.getPaymentStatus()
                .equals(PaymentStatus.PURCHASE.getDescription()) ?
                PaymentStatus.CANCEL.getDescription() : PaymentStatus.PURCHASE.getDescription();
        paymentHistoryCustomRepository.updateStatusHistory(paymentHistoryEntity.getUUID(), changedStatus);
    }

    /**
     * 결제내역 타입 변경
     */
    public void changeTypePaymentHistory(PaymentUUIDRequest paymentUUIDRequest) {
        PaymentHistory paymentHistoryEntity = getPaymentHistory(paymentUUIDRequest.getPaymentUUID());
        // 타입 변경 : QR -> CASH, CASH -> QR
        String changedType = paymentHistoryEntity.getPaymentType()
                .equals(PaymentType.QRCODE.getDescription()) ?
                PaymentType.CASH.getDescription() : PaymentType.QRCODE.getDescription();
        paymentHistoryCustomRepository.updateTypeHistory(paymentHistoryEntity.getUUID(), changedType);
    }

    /**
     * 결제내역 상세 조회
     */
    public PaymentDetailResponse selectDetailPaymentHistory(PaymentUUIDRequest paymentUUIDRequest) {
        PaymentHistory paymentHistoryEntity = getPaymentHistory(paymentUUIDRequest.getPaymentUUID());
        return PaymentDetailResponse.builder()
                .paymentType(paymentHistoryEntity.getPaymentType())
                .paymentStatus(paymentHistoryEntity.getPaymentStatus())
                .buyProduct(paymentHistoryEntity.getBuyProductHistories())
                .totalCost(paymentHistoryEntity.getTotalCost())
                .createdAt(paymentHistoryEntity.getUpdatedAt())
                .UUID(paymentHistoryEntity.getUUID())
                .build();
    }

    /**
     * 결제내역 중 "구매" 상태만 목록 조회
     */
    public List<PaymentHistoryListResponse> getSuccessHistoryList(Integer storeId) {
        List<PaymentHistory> paymentHistoryEntity = getHistoryByPaymentStatus(storeId, PaymentStatus.PURCHASE.getDescription());
        return paymentHistoryEntity.stream()
                .map(PaymentMapper::convertPaymentHistoryListResponse)
                .toList();
    }

    /**
     * 결제내역 중 "취소" 상태만 목록 조회
     */
    public List<PaymentHistoryListResponse> getCancelHistoryList(Integer storeId) {
        List<PaymentHistory> paymentHistoryEntity = getHistoryByPaymentStatus(storeId, PaymentStatus.CANCEL.getDescription());

        return paymentHistoryEntity.stream()
                .map(PaymentMapper::convertPaymentHistoryListResponse)
                .toList();
    }

    /**
     * 결제내역을 상태, 최신 순으로 가져오는 메서드
     */
    public List<PaymentHistory> getHistoryByPaymentStatus(Integer storeId, String statusDesc) {
        return paymentHistoryRepository
                .findByStoreIdAndPaymentStatus(storeId, statusDesc, Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    /**
     * UUID 결제내역을 가져오는 메서드
     */
    public PaymentHistory getPaymentHistory(String UUID) {
        return paymentHistoryRepository.findByUUID(UUID)
                .orElseThrow(() -> new BusinessException(CommonErrorCode.NOT_FOUND, "존재하지 않는 결제기록 입니다."));
    }

    /**
     * 시간별 매출 조회
     */
    public SalesByDayResponse fetchSalesByTime(Integer storeId, String startDate, String endDate) {
        List<SalesResponse> salesByDayResponseList = paymentHistoryRepository.getTimeSales(storeId, startDate, endDate)
                .orElseThrow(() -> new BusinessException(CommonErrorCode.NOT_FOUND, "조회된 매출이 없습니다"));
        return SalesByDayResponse.builder()
                .salesByDay(salesByDayResponseList).build();
    }

    /**
     * 일간 매출 조회
     */
    public SalesByDayResponse fetchSalesByDay(Integer storeId, String startDate, String endDate) {
        List<SalesResponse> salesByDayResponseList = paymentHistoryRepository.getDailySales(storeId, startDate, endDate)
                .orElseThrow(() -> new BusinessException(CommonErrorCode.NOT_FOUND, "조회된 매출이 없습니다"));
        return SalesByDayResponse.builder()
                .salesByDay(salesByDayResponseList).build();
    }

    /**
     * 주간 매출 조회
     */
    public SalesByWeekResponse fetchSalesByWeek(Integer storeId, String startDate, String endDate) {

        List<SalesResponse> salesByDayResponseList = paymentHistoryRepository.getWeeklySales(storeId, startDate, endDate)
                .orElseThrow(() -> new BusinessException(CommonErrorCode.NOT_FOUND, "조회된 매출이 없습니다"));
        return SalesByWeekResponse.builder()
                .salesByWeek(salesByDayResponseList).build();
    }

    /**
     * 월간 매출 조회
     */
    public SalesByMonthResponse fetchSalesByMonth(Integer storeId, String startDate, String endDate) {
        List<SalesResponse> salesByDayResponseList = paymentHistoryRepository.getMonthlySales(storeId, DateTimeUtils.getStartOfMonth(startDate), DateTimeUtils.getEndOfMonth(endDate))
                .orElseThrow(() -> new BusinessException(CommonErrorCode.NOT_FOUND, "조회된 매출이 없습니다"));
        return SalesByMonthResponse.builder()
                .salesByMonth(salesByDayResponseList).build();
    }

    /**
     *  해당 기간 팔린 상품 집계
     */
    public Map<Long, Integer> getTotalSoldByProduct(Integer storeId, String startDate, String endDate) {
        List<ProductTotalSold> productTotalSoldList = paymentHistoryRepository.getProductSoldByStoreAndPeriod(storeId, startDate, endDate)
                .orElseThrow(() -> new BusinessException(CommonErrorCode.NOT_FOUND, "판매 데이터를 찾지 못 했습니다!"));
        log.info(productTotalSoldList.toString());
        Map<Long, Integer> productSalesMap = productTotalSoldList.stream()
                .collect(Collectors.toMap(ProductTotalSold::getProductId, ProductTotalSold::getTotalQuantity));
        log.info(productSalesMap.toString());
        return productSalesMap;
    }

    /**
     * 해당 기간동안 팔린 물건 별 판매 개수 조회
     */
    public List<ProductSoldCountResponse> getMonthSoldByStoreId(Integer storeId, String startDate, String endDate) {
        return paymentHistoryRepository.getRangeDateSaleProduct(storeId, startDate, endDate)
                .orElseGet(ArrayList::new);
    }

}
