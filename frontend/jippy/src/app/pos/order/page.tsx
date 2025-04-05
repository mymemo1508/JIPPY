"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProductGrid from "@/features/pos/order/components/ProductGrid";
import { ProductDetailResponse } from "@/redux/types/product";
import { OrderItem, PaymentMethod } from "@/features/pos/order/types/pos";
import {
  calculateTotal,
  convertToProduct,
} from "@/features/pos/order/components/utils";
import { OrderPayment } from "@/features/pos/order/components/OrderSummary";
import { CashPaymentModal } from "@/features/pos/order/components/CashPaymentModal";
import { useDispatch } from 'react-redux';
import { setOrderData } from '@/redux/slices/paymentSlice'; // 이 액션을 생성해야 합니다


const POSPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null
  );
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [storeId, setStoreId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof document !== "undefined") {
      const storeIdFromCookie =
        document.cookie
          .split("; ")
          .find((cookie) => cookie.startsWith("selectStoreId="))
          ?.split("=")[1] || null;

      setStoreId(storeIdFromCookie);
    }
  }, []);

  const handleAddProduct = (productDetail: ProductDetailResponse) => {
    const product = convertToProduct(productDetail);
    const existingItemIndex = currentOrder.findIndex(
      (item) => item.id === product.id
    );

    if (existingItemIndex > -1) {
      const updatedOrder = [...currentOrder];
      updatedOrder[existingItemIndex] = {
        ...updatedOrder[existingItemIndex],
        quantity: updatedOrder[existingItemIndex].quantity + 1,
        name: product.name, // 🔹 상품 이름 추가
      };
      setCurrentOrder(updatedOrder);
    } else {
      setCurrentOrder([
        ...currentOrder,
        { ...product, quantity: 1, name: product.name },
      ]);
    }
  };

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity === 0) {
      setCurrentOrder(currentOrder.filter((item) => item.id !== productId));
    } else {
      const updatedOrder = currentOrder.map((item) =>
        item.id === productId
          ? { ...item, quantity: newQuantity, name: item.name }
          : item
      );
      setCurrentOrder(updatedOrder);
    }
  };

  const handleCancelOrder = () => {
    setCurrentOrder([]);
    setPaymentMethod(null);
    setIsCashModalOpen(false);
  };

  const handleCashPayment = async (request: {
    storeId: number;
    totalCost: number;
    productList: Array<{
      productId: number;
      quantity: number;
    }>;
    receivedAmount: number; // CashPaymentModal에서 전달받지만 API 요청에는 포함하지 않음
  }) => {
    try {
      const paymentRequest = {
        storeId: Number(storeId),
        totalCost: request.totalCost,
        paymentType: "CASH",
        productList: request.productList,
        cashRequest: {
          fifty_thousand_won: 0,
          ten_thousand_won: 0,
          five_thousand_won: 0,
          one_thousand_won: 0,
          five_hundred_won: 0,
          one_hundred_won: 0,
          fifty_won: 0,
          ten_won: 0,
        },
      };

      console.log("=== 현금 결제 요청 시작 ===");
      console.log("Request Body:", JSON.stringify(paymentRequest, null, 2));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payment/cash/confirm`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(paymentRequest),
        }
      );

      const responseData = await response.json();
      console.log("결제 응답 데이터:", responseData);

      if (!response.ok) {
        throw new Error(
          responseData?.message || "현금 결제 처리에 실패했습니다"
        );
      }

      if (responseData.success) {
        console.log("현금 결제 성공, 결제 내역 추가 시작");

        console.log("결제 내역 추가 성공");
        handleCancelOrder();
      } else {
        throw new Error(
          responseData.message || "현금 결제 처리에 실패했습니다"
        );
      }

      // console.log("=== 현금 결제 프로세스 완료 ===");
    } catch (error) {
      // console.error("=== 현금 결제 오류 상세 ===");
      if (error instanceof Error) {
        // console.error("Error name:", error.name);
        // console.error("Error message:", error.message);
        // console.error("Error stack:", error.stack);
      } else {
        // console.error("Unknown error:", error);
      }
      alert("결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
      throw error;
    }
  };

  const handlePaymentSubmit = async () => {
    if (!paymentMethod) {
      alert("결제 방법을 선택해주세요.");
      return;
    }

    if (paymentMethod === "qr") {
      const orderData = {
        totalAmount: calculateTotal(currentOrder),
        orderName: `주문 ${new Date().toLocaleString()}`,
        customerName: "고객",
        storeId: Number(storeId),
        products: currentOrder.map((item) => ({
          id: item.id,
          name: item.name,
          type: item.type,
          size: item.size,
          quantity: item.quantity,
        })),
      };
      console.log("QR 결제 요청 데이터:", orderData);

      try {
        dispatch(setOrderData(orderData));
        // localStorage.setItem("orderData", JSON.stringify(orderData));
        router.push("payment/request");
      } catch (error) {
        console.error("Error saving order data:", error);
        alert("주문 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
      return;
    }

    if (paymentMethod === "cash") {
      setIsCashModalOpen(true);
      return;
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      <div className="w-4/6 overflow-y-auto pb-8">
        <ProductGrid onAddProduct={handleAddProduct} />
      </div>

      <div className="w-2/6 h-full">
        <OrderPayment
          currentOrder={currentOrder}
          onQuantityChange={handleQuantityChange}
          calculateTotal={() => calculateTotal(currentOrder)}
          paymentMethod={paymentMethod}
          onSelectPaymentMethod={setPaymentMethod}
          onPaymentSubmit={handlePaymentSubmit}
          onCancelOrder={handleCancelOrder}
        />
      </div>

      <CashPaymentModal
        isOpen={isCashModalOpen}
        onClose={() => setIsCashModalOpen(false)}
        totalAmount={calculateTotal(currentOrder)}
        onConfirm={handleCashPayment}
        storeId={Number(storeId)}
        productList={currentOrder.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        }))}
      />
    </div>
  );
};

export default POSPage;
