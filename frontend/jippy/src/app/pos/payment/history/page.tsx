"use client";

import { useState } from "react";
import PaymentHistoryList from "@/features/pos/payment/components/HistoryList";
import PaymentHistoryDetail from "@/features/pos/payment/components/HistoryDetail";
import PettyCashModal from "@/features/pos/payment/components/PettyCashModal";
import {
  PaymentHistoryDetail as PaymentDetailType,
  PaymentHistoryItem,
  ApiResponse,
} from "@/features/pos/payment/types/history";

const PaymentHistoryPage = () => {
  const [selectedPayment, setSelectedPayment] = useState<PaymentDetailType | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [historyFilter, setHistoryFilter] = useState<"all" | "success" | "cancel">("all");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);

  const fetchPaymentDetail = async (storeId: number, paymentUUID: string) => {
    setIsLoading(true);
    setError(null);
 
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payment-history/detail`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentUUID,
            storeId: 1,
          }),
        }
      );
 
      if (!response.ok) {
        throw new Error("결제 상세 정보를 불러오는데 실패했습니다");
      }
 
      const result: ApiResponse<PaymentDetailType> = await response.json();
 
      if (!result.success) {
        throw new Error("결제 상세 정보를 불러오는데 실패했습니다");
      }
 
      const transformedPayment = {
        ...result.data,
        paymentStatus: result.data.paymentStatus === "PURCHASE" ? "완료" : 
                      result.data.paymentStatus === "CANCEL" ? "취소" : 
                      result.data.paymentStatus
      };
      
      setSelectedPayment(transformedPayment);
    } catch (error) {
      setError("알 수 없는 오류가 발생했습니다");
      console.log(error);
      setSelectedPayment(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentStatusChange = async (updatedPayment: PaymentDetailType) => {
    setSelectedPayment(updatedPayment);
    if (selectedPayment) {
      await fetchPaymentDetail(1, selectedPayment.uuid);
    }
  };

  return (
    <div className="page-content">
      <div className="w-full h-full p-8 overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">결제 내역</h1>
          <button
            onClick={() => setIsCashModalOpen(true)}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200"
          >
            정산
          </button>
        </div>
  
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100%-60px)]">
          <div className="lg:col-span-7 bg-white shadow rounded-lg overflow-hidden h-full">
            <PaymentHistoryList
              filter={historyFilter}
              onSelectPayment={(payment: PaymentHistoryItem) => {
                fetchPaymentDetail(1, payment.uuid);
              }}
              onPaymentStatusChange={handlePaymentStatusChange}
            />
          </div>
  
          <div className="lg:col-span-5 bg-white shadow rounded-lg overflow-hidden h-full">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500 mx-auto" />
                  <p className="mt-2 text-gray-600">상세 정보를 불러오는 중...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-red-500 p-4 text-center bg-red-50 rounded-lg mx-4 max-w-md">
                  <p className="font-medium">오류 발생</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            ) : selectedPayment ? (
              <PaymentHistoryDetail 
                payment={selectedPayment}
                onPaymentStatusChange={handlePaymentStatusChange}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <p className="text-lg">결제 내역을 선택해주세요</p>
                </div>
              </div>
            )}
          </div>
        </div>
  
        <PettyCashModal
          isOpen={isCashModalOpen}
          onClose={() => setIsCashModalOpen(false)}
          storeId={1}
        />
      </div>
    </div>
  );
};

export default PaymentHistoryPage;