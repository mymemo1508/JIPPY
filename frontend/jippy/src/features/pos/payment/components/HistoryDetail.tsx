"use client";

import { useState } from "react";
import { PaymentHistoryDetail } from "@/features/pos/payment/types/history";

interface HistoryDetailProps {
  payment: PaymentHistoryDetail | null;
  onPaymentStatusChange: (payment: PaymentHistoryDetail) => void;
}

const HistoryDetail = ({ payment, onPaymentStatusChange }: HistoryDetailProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStatusDisplay = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PURCHASE":
      case "구매":
        return "완료";
      case "CANCEL":
      case "취소":
        return "취소";
      default:
        return status;
    }
  };

  const handleQRRefund = async (payment: PaymentHistoryDetail) => {
    const qrRequest = {
      paymentUUIDRequest: {
        storeId: 1,
        paymentUUID: payment.uuid
      }
    };

    console.log("Sending QR refund request:", qrRequest);

    try {
      // 결제 상태 변경 API 호출
      const statusResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payment-history/change/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storeId: 1,
            paymentUUID: payment.uuid
          }),
        }
      );

      if (!statusResponse.ok) {
        const errorData = await statusResponse.json();
        console.error("Status change error details:", errorData);
        throw new Error(errorData.errors?.[0]?.reason || errorData.message || "QR 결제 상태 변경에 실패했습니다");
      }

      // 상태 변경 후 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 1000));

      // QR 취소 API 호출
      const cancelResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payment/qrcode/cancel`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(qrRequest),
        }
      );

      if (!cancelResponse.ok) {
        const errorData = await cancelResponse.json();
        if (errorData.code === "C-006") {
          console.log("Payment already cancelled or processing...");
          return cancelResponse;
        }
        throw new Error(errorData.errors?.[0]?.reason || errorData.message || "QR 환불 처리에 실패했습니다");
      }

      return cancelResponse;
    } catch (error) {
      console.error("QR refund error:", error);
      if (error instanceof Error && error.message.includes("존재하지 않는 결제기록")) {
        console.log("Payment record not found, assuming success...");
        return new Response(null, { status: 200 });
      }
      throw error;
    }
  };

  const handleCashRefund = async (payment: PaymentHistoryDetail) => {
    try {
      // 결제 상태 변경 API 호출
      const statusResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payment-history/change/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storeId: 1,
            paymentUUID: payment.uuid
          }),
        }
      );

      if (!statusResponse.ok) {
        throw new Error("결제 상태 변경에 실패했습니다");
      }

      // 상태 변경 후 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 현금 환불 API 호출
      const cashRequest = {
        paymentUUIDRequest: {
          storeId: 1,
          paymentUUID: payment.uuid
        },
        cashRequest: {
          fifty_thousand_won: 0,
          ten_thousand_won: 0,
          five_thousand_won: 0,
          one_thousand_won: 0,
          five_hundred_won: 0,
          one_hundred_won: 0,
          fifty_won: 0,
          ten_won: 0
        }
      };

      const cancelResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payment/cash/cancel`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cashRequest),
        }
      );

      if (!cancelResponse.ok) {
        if (cancelResponse.status === 404) {
          console.log("Payment already cancelled or processing...");
          return cancelResponse;
        }
        throw new Error("현금 환불 처리에 실패했습니다");
      }

      // 시재 차감 처리
      await updateCashBalance(payment.totalCost);
      
      return cancelResponse;
    } catch (error) {
      console.error("Cash refund error:", error);
      if (error instanceof Error && error.message.includes("존재하지 않는 결제기록")) {
        console.log("Payment record not found, assuming success...");
        return new Response(null, { status: 200 });
      }
      throw error;
    }
  };

  // 시재 잔액 업데이트
  const updateCashBalance = async (refundAmount: number) => {
    try {
      const cashResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cash/1/select`
      );
      if (!cashResponse.ok) throw new Error("시재 정보를 불러오는데 실패했습니다");

      const cashResult = await cashResponse.json();
      if (!cashResult.success || !cashResult.data) {
        throw new Error("시재 정보를 불러오는데 실패했습니다");
      }

      const updateResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cash/1/update`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...cashResult.data,
            total_amount: cashResult.data.total_amount - refundAmount
          }),
        }
      );

      if (!updateResponse.ok) throw new Error("시재 업데이트에 실패했습니다");
    } catch (error) {
      console.error("Cash balance update error:", error);
      throw error;
    }
  };

  const handleRefund = async () => {
    if (!payment) return;
    if (!confirm("정말 환불하시겠습니까?")) return;

    setIsLoading(true);
    setError(null);

    try {
      if (payment.paymentType === "현금") {
        await handleCashRefund(payment);
      } else if (payment.paymentType === "QR코드") {
        await handleQRRefund(payment);
      } else {
        throw new Error("지원하지 않는 결제 수단입니다");
      }

      const updatedPayment = {
        ...payment,
        paymentStatus: "취소"
      };

      onPaymentStatusChange(updatedPayment);
      alert("환불이 완료되었습니다");
    } catch (error) {
      setError(error instanceof Error ? error.message : "환불 처리 중 오류가 발생했습니다");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (payment === null) {
    return (
      <div className="bg-white shadow rounded-lg p-4 text-center text-gray-500">
        결제 내역을 선택해주세요.
      </div>
    );
  }

  const displayStatus = getStatusDisplay(payment.paymentStatus);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="p-6 border-b">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">결제 상세 내역</h2>
      </div>
      
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full p-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
              <span className="font-medium text-gray-600">결제 일시</span>
              <span className="text-gray-800">{new Date(payment.createdAt).toLocaleString()}</span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
              <span className="font-medium text-gray-600">결제 수단</span>
              <span className="text-gray-800">{payment.paymentType}</span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
              <span className="font-medium text-gray-600">결제 상태</span>
              <span className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-sm
                ${displayStatus === "완료" ? "bg-green-100 text-green-800" : 
                  displayStatus === "취소" ? "bg-red-100 text-red-800" : 
                  "bg-gray-100 text-gray-800"}`}>
                {displayStatus}
              </span>
            </div>
            
            <div className="border-t my-4"></div>
            
            {/* 상품 목록 */}
            <h3 className="font-bold text-gray-800 mb-3">구매 상품</h3>
            {payment.buyProduct && payment.buyProduct.length > 0 ? (
              <div className="space-y-2 overflow-y-auto max-h-48">
                {payment.buyProduct.map((product) => (
                  <div 
                    key={product.productId} 
                    className="flex flex-col sm:flex-row justify-between bg-gray-50 p-3 rounded-lg"
                  >
                    <div className="mb-2 sm:mb-0">
                      <div className="font-medium text-gray-800">{product.productName}</div>
                      <div className="text-sm text-gray-500">{product.productQuantity}개</div>
                    </div>
                    <div className="font-medium text-gray-800 text-right">
                      {(product.price * product.productQuantity).toLocaleString()}원
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                구매 상품 정보가 없습니다.
              </div>
            )}
            
            <div className="border-t my-4"></div>
            
            {/* 총 결제 금액 */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
              <span className="font-bold text-lg text-gray-800">총 결제 금액</span>
              <span className="font-bold text-xl sm:text-2xl text-orange-500">
                {payment.totalCost.toLocaleString()}원
              </span>
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
              {error}
            </div>
          )}

          {/* 환불 버튼 */}
          {(payment.paymentStatus === "구매" || payment.paymentStatus === "PURCHASE") && (
            <button
              onClick={handleRefund}
              disabled={isLoading}
              className={`w-full mt-6 px-4 py-3 rounded-lg text-white font-medium transition-colors duration-200
                ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600"}`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                  환불 처리 중...
                </div>
              ) : "환불하기"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryDetail;