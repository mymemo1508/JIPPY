"use client";

import React, { useState } from "react";
import { loadTossPayments } from "@tosspayments/payment-sdk";
import { Card } from "@/features/common/components/ui/card/Card";
import { Button } from "@/features/common/components/ui/button";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { setOrderData } from "@/redux/slices/paymentSlice"; 

const TOSS_CLIENT_KEY = "test_ck_yZqmkKeP8gpJeNxBdjGd3bQRxB9l";

const generateRandomOrderId = () => {
  return "xxxx-xxxx-4xxx-yxxx-xxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const PaymentRequestComponent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const orderData = useAppSelector((state) => state.payment.orderData);

  if (!orderData) {
    return null;
  }

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      const orderId = generateRandomOrderId();

      // 결제에 필요한 정보를 리덕스 스토어에 저장
      const paymentReadyData = {
        ...orderData,
        products: orderData.products.map(product => ({
          id: product.id,
          quantity: product.quantity,
          name: product.name,
          size: product.size,
          type: product.type
        }))
      };
      
      // 기존 orderData를 업데이트
      dispatch(setOrderData(paymentReadyData));

      // 필수 데이터만 URL 파라미터로 인코딩
      const essentialData = {
        storeId: orderData.storeId || "default-store",
        products: orderData.products.map(product => ({
          id: product.id,
          quantity: product.quantity
        }))
      };
      
      const encodedData = encodeURIComponent(JSON.stringify(essentialData));

      const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);

      const paymentData = {
        amount: orderData.totalAmount,
        orderId: orderId,
        orderName: orderData.orderName || "주문",
        customerName: orderData.customerName || "고객",
        successUrl: `${process.env.NEXT_PUBLIC_API_URL}/pos/payment/success?storeData=${encodedData}`,
        failUrl: `${process.env.NEXT_PUBLIC_API_URL}/pos/payment/fail`,
      };
      
      console.log("결제 요청 데이터:", paymentData);
      await tossPayments.requestPayment("토스페이", paymentData);
    } catch (error: unknown) {
      console.error("결제 요청 중 오류 발생:", error);
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "USER_CANCEL"
      ) {
        alert("결제가 취소되었습니다.");
      } else {
        alert("결제 요청 중 오류가 발생했습니다.");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-#f8f8f8">
      <Card className="bg-white w-full max-w-2xl">
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6">주문 결제</h2>{" "}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">주문 금액</span>
              <span className="font-semibold">
                {orderData.totalAmount?.toLocaleString()}원
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">주문명</span>
              <span>{orderData.orderName || "주문"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">주문자</span>
              <span>{orderData.customerName || "고객"}</span>
            </div>
            {orderData.products && (
              <div className="mt-4 border-t pt-4">
                <h3 className="font-semibold mb-2">주문 상품</h3>
                <div className="border rounded overflow-hidden">
                  <div className="grid grid-cols-12 text-center bg-gray-100 font-medium">
                  <div className="py-2 col-span-2">No.</div>
                  <div className="py-2 pl-3 col-span-4 text-left">상품명</div>
                  <div className="py-2 col-span-2">사이즈</div>
                  <div className="py-2 col-span-2">옵션</div>
                  <div className="py-2 col-span-2">수량</div>
                </div>
                
                <div className="max-h-[260px] overflow-y-auto">
                  {orderData.products.map((product, index) => (
                    <div key={index} className="grid grid-cols-12 text-center border-b border-gray-100">
                      <div className="py-3 col-span-2">{index + 1}</div>
                      <div className="py-3 pl-2 text-left col-span-4">{product.name}</div>
                      <div className="py-3 col-span-2">{String(product.size) === 'F' ? '' : product.size}</div>
                      <div className="py-3 col-span-2">{String(product.type) === 'EXTRA' ? '' : product.type}</div>
                      <div className="py-3 col-span-2">{product.quantity}개</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            )}
            <Button
              onClick={handlePayment}
              disabled={isLoading}
              className="w-full bg-jippy-orange hover:bg-orange-600 text-white mt-4"
            >
              {isLoading ? "처리중..." : "결제하기"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PaymentRequestComponent;