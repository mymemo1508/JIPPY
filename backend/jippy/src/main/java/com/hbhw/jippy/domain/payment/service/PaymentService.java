package com.hbhw.jippy.domain.payment.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hbhw.jippy.domain.cash.service.CashService;
import com.hbhw.jippy.domain.payment.dto.request.*;
import com.hbhw.jippy.domain.payment.entity.BuyProduct;
import com.hbhw.jippy.domain.payment.entity.PaymentHistory;
import com.hbhw.jippy.domain.payment.enums.PaymentStatus;
import com.hbhw.jippy.domain.payment.enums.PaymentType;
import com.hbhw.jippy.domain.payment.repository.PaymentHistoryCustomRepository;
import com.hbhw.jippy.domain.product.entity.Ingredient;
import com.hbhw.jippy.domain.product.entity.Product;
import com.hbhw.jippy.domain.product.entity.Recipe;
import com.hbhw.jippy.domain.product.service.ProductService;
import com.hbhw.jippy.domain.product.service.RecipeService;
import com.hbhw.jippy.domain.stock.entity.InventoryItem;
import com.hbhw.jippy.domain.stock.service.StockService;
import com.hbhw.jippy.domain.stock.service.StockStatusService;
import com.hbhw.jippy.global.code.CommonErrorCode;
import com.hbhw.jippy.global.error.BusinessException;
import com.hbhw.jippy.utils.DateTimeUtils;
import com.hbhw.jippy.utils.UUIDProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {
    private final CashService cashService;
    private final ProductService productService;
    private final PaymentHistoryService paymentHistoryService;
    private final PaymentHistoryCustomRepository paymentHistoryCustomRepository;
    private final StockStatusService stockStatusService;
    private final StockService stockService;
    private final RecipeService recipeService;
    private final UUIDProvider uuidProvider;
    private final ObjectMapper objectMapper;

    @Value("${toss.secret.key}")
    private String secretKey;

    /**
     * 현금결제 확인
     */
    public void cashPaymentConfirm(ConfirmCashPaymentRequest confirmCashPaymentRequest) {
        Integer storeId = confirmCashPaymentRequest.getStoreId();
        basePaymentConfirm(confirmCashPaymentRequest, PaymentType.CASH, "");
        cashService.updatePaymentCash(storeId, confirmCashPaymentRequest.getCashRequest());
    }

    /**
     * QrCode 결제 확인
     */
    public void qrCodePaymentConfirm(ConfirmQrCodePaymentRequest confirmQrCodePaymentRequest) {
        try {
            HttpResponse<String> response = tossPaymentConfirm(confirmQrCodePaymentRequest);
            log.info("TossServerConfirm - OK");
            basePaymentConfirm(confirmQrCodePaymentRequest, PaymentType.QRCODE, confirmQrCodePaymentRequest.getPaymentKey());
            log.info("basePayment - OK");
        } catch (Exception e) {
            log.error("Error : 결제 실패 : {}", e.getClass().getName());
            throw new BusinessException(CommonErrorCode.INTERNAL_SERVER_ERROR, "결제서버와 연결이 불가능합니다. 다시 시도해 주세요");
        }
    }

    /**
     * 결제 후 재고량스텟 감소 및 결제내역 저장
     */
    private void basePaymentConfirm(ConfirmPaymentRequest confirmPaymentRequest, PaymentType paymentType, String PaymentKey) {
        List<BuyProduct> buyProductList = new ArrayList<>();

        for (PaymentProductInfoRequest info : confirmPaymentRequest.getProductList()) {
            Product productEntity = productService.getProduct(confirmPaymentRequest.getStoreId(), info.getProductId());
            BuyProduct buyProduct = BuyProduct.builder()
                    .productId(productEntity.getId())
                    .price(productEntity.getPrice())
                    .productName(productEntity.getName())
                    .productCategoryId(productEntity.getProductCategory().getId())
                    .productQuantity(info.getQuantity())
                    .build();
            buyProductList.add(buyProduct);
        }

        PaymentHistory paymentHistoryEntity = PaymentHistory.builder()
                .paymentType(paymentType.getDescription())
                .paymentStatus(PaymentStatus.PURCHASE.getDescription())
                .UUID(uuidProvider.generateUUID())
                .paymentKey(PaymentKey)
                .updatedAt(DateTimeUtils.nowString())
                .totalCost(confirmPaymentRequest.getTotalCost())
                .storeId(confirmPaymentRequest.getStoreId())
                .buyProductHistories(buyProductList)
                .build();

        List<InventoryItem> inventoryItemList = stockService.getInventoryItemList(confirmPaymentRequest.getStoreId());
        List<StockStatusService.StockUpdateInfo> stockUpdateInfoList = new ArrayList<>();

        for (PaymentProductInfoRequest product : confirmPaymentRequest.getProductList()) {
            Optional<Recipe> recipeEntity = recipeService.getRecipeOrEmpty(product.getProductId());
            if (recipeEntity.isEmpty()) {
                continue;
            }

            for (Ingredient ingredient : recipeEntity.get().getIngredient()) {
                InventoryItem beforeInventory = new InventoryItem();
                boolean isMatch = false;
                for (InventoryItem item : inventoryItemList) {
                    if (ingredient.getName().equals(item.getStockName())) {
                        beforeInventory = item;
                        isMatch = true;
                        break;
                    }
                }
                if(!isMatch){
                    continue;
                }
                InventoryItem newInventoryItem = InventoryItem.builder()
                        .stock(beforeInventory.getStock())
                        .stockName(beforeInventory.getStockName())
                        .stockTotalValue(beforeInventory.getStockTotalValue())
                        .updatedAt(beforeInventory.getUpdatedAt())
                        .build();

                StockStatusService.StockUpdateInfo stockUpdateInfo = StockStatusService.StockUpdateInfo.builder()
                        .item(newInventoryItem)
                        .decreaseAmount(ingredient.getAmount() * product.getQuantity())
                        .build();

                stockUpdateInfoList.add(stockUpdateInfo);
            }
        }

        stockStatusService.updateBatchStockStatus(confirmPaymentRequest.getStoreId(), stockUpdateInfoList);
        paymentHistoryService.savePaymentHistory(paymentHistoryEntity);
    }

    /**
     * 현금결제 취소
     */
    public void cancelCashPayment(CancelCashPaymentRequest request) {
        PaymentHistory paymentHistoryEntity = paymentHistoryService
                .getPaymentHistory(request.getPaymentUUIDRequest().getPaymentUUID());

        baseCancelPayment(request.getPaymentUUIDRequest(), paymentHistoryEntity);
        cashService.updatePaymentCash(paymentHistoryEntity.getStoreId(), request.getCashRequest());
    }

    /**
     * QrCode 결제 취소
     */
    public void cancelQrCodePayment(PaymentUUIDRequest paymentUUIDRequest) {
        PaymentHistory paymentHistoryEntity = paymentHistoryService
                .getPaymentHistory(paymentUUIDRequest.getPaymentUUID());
        try {
            tossPaymentCancel(paymentHistoryEntity.getPaymentKey());
            baseCancelPayment(paymentUUIDRequest, paymentHistoryEntity);
        } catch (Exception e) {
            throw new BusinessException(CommonErrorCode.INTERNAL_SERVER_ERROR, "결제서버와 연결이 불가능합니다. 다시 시도해 주세요");
        }
    }

    /**
     * 결제 취소에 따른 재고량 복구 및 결제취소 내역 업데이트
     */
    private void baseCancelPayment(PaymentUUIDRequest paymentUUIDRequest, PaymentHistory paymentHistoryEntity) {
        List<InventoryItem> inventoryItemList = stockService.getInventoryItemList(paymentUUIDRequest.getStoreId());
        List<StockStatusService.StockUpdateInfo> stockUpdateInfoList = new ArrayList<>();

        for (BuyProduct product : paymentHistoryEntity.getBuyProductHistories()) {
            Recipe recipeEntity = recipeService.getRecipe(product.getProductId());

            for (Ingredient ingredient : recipeEntity.getIngredient()) {
                InventoryItem beforeInventory = new InventoryItem();

                for (InventoryItem item : inventoryItemList) {
                    if (ingredient.getName().equals(item.getStockName())) {
                        beforeInventory = item;
                        break;
                    }
                }

                InventoryItem newInventoryItem = InventoryItem.builder()
                        .stock(beforeInventory.getStock())
                        .stockName(beforeInventory.getStockName())
                        .stockTotalValue(beforeInventory.getStockTotalValue())
                        .updatedAt(beforeInventory.getUpdatedAt())
                        .build();

                StockStatusService.StockUpdateInfo stockUpdateInfo = StockStatusService.StockUpdateInfo.builder()
                        .item(newInventoryItem)
                        .decreaseAmount(ingredient.getAmount() * product.getProductQuantity() * -1)
                        .build();

                stockUpdateInfoList.add(stockUpdateInfo);
            }
        }
        paymentHistoryCustomRepository.updateTypeHistory(paymentHistoryEntity.getUUID(), PaymentStatus.CANCEL.getDescription());
        stockStatusService.updateBatchStockStatus(paymentUUIDRequest.getStoreId(), stockUpdateInfoList);
    }

    /**
     * TossPay 결제 확인 요청
     */
    private HttpResponse<String> tossPaymentConfirm(ConfirmQrCodePaymentRequest request) throws IOException, InterruptedException {
        JsonNode json = objectMapper.createObjectNode()
                .put("orderId", request.getOrderId())
                .put("paymentKey", request.getPaymentKey())
                .put("amount", request.getAmount().intValue());
        String requestBody = objectMapper.writeValueAsString(json);
        String auth = Base64.getEncoder().encodeToString((secretKey + ":").getBytes());

        HttpRequest confirmRequest = HttpRequest.newBuilder()
                .uri(URI.create("https://api.tosspayments.com/v1/payments/confirm"))
                .header("Authorization", "Basic " + auth)
                .header("Content-Type", "application/json")
                .method("POST", HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        return HttpClient.newHttpClient().send(confirmRequest, HttpResponse.BodyHandlers.ofString());
    }

    /**
     * TossPay 결제 취소 요청
     */
    private void tossPaymentCancel(String paymentKey) throws IOException, InterruptedException {
        JsonNode json = objectMapper.createObjectNode()
                .put("cancelReason", "환불 요청");
        String requestBody = objectMapper.writeValueAsString(json);
        String auth = Base64.getEncoder().encodeToString((secretKey + ":").getBytes());

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.tosspayments.com/v1/payments/" + paymentKey + "/cancel"))
                .header("Authorization", "Basic " + auth)
                .header("Content-Type", "application/json")
                .method("POST", HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
    }
}
