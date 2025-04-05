"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { confirmPayment, clearPaymentState } from "@/redux/slices/paymentSlice";
import type { PaymentConfirmRequest } from "@/features/pos/payment/types/payment";

// 페이지를 동적으로 처리하도록 설정
export const dynamic = "force-dynamic";

// 제품과 스토어 데이터 타입 정의
interface ProductData {
  id: string | number;
  quantity: number;
}

interface StoreData {
  storeId: string | number; // storeId가 string 또는 number 타입일 수 있음
  products: ProductData[];
}

// 에러 타입 정의
interface ErrorWithMessage {
  message: string;
}

// 실제 결제 처리를 담당하는 컴포넌트
const PaymentSuccessContent = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleConfirmPayment = async () => {
    setIsLoading(true);
    setError(null);
  
    try {
      const paymentKey = searchParams.get("paymentKey");
      const orderId = searchParams.get("orderId");
      const amount = searchParams.get("amount");
      const storeDataParam = searchParams.get("storeData");
  
      if (!paymentKey || !orderId || !amount) {
        throw new Error("필수 파라미터가 누락되었습니다.");
      }
  
      if (!storeDataParam) {
        throw new Error("주문 정보 파라미터가 누락되었습니다.");
      }
      
      // URL 파라미터에서 storeData 파싱
      let storeData: StoreData;
      try {
        storeData = JSON.parse(decodeURIComponent(storeDataParam));
      } catch {
        throw new Error("주문 정보 파싱에 실패했습니다.");
      }
      
      if (!storeData.storeId || !storeData.products) {
        throw new Error("주문 정보 형식이 올바르지 않습니다.");
      }
  
      const amountNumber = Number(amount);

      // storeId를 number로 변환 (PaymentConfirmRequest 타입에 맞춤)
      const storeIdNumber = typeof storeData.storeId === 'string' 
        ? parseInt(storeData.storeId, 10) || 0 // 변환 실패 시 기본값 0
        : storeData.storeId;

      const requestBody: PaymentConfirmRequest = {
        storeId: storeIdNumber,
        totalCost: amountNumber,
        paymentType: "QRCODE",
        productList: storeData.products.map((product: ProductData) => ({
          productId: typeof product.id === 'string' ? parseInt(product.id, 10) || 0 : product.id,
          quantity: product.quantity
        })),
        orderId,
        paymentKey,
        amount: amountNumber
      };
  
      const resultAction = await dispatch(confirmPayment(requestBody));
      
      if (confirmPayment.fulfilled.match(resultAction)) {
        setIsConfirmed(true);
        
        // 결제 완료 후 리덕스 스토어 정리
        setTimeout(() => {
          dispatch(clearPaymentState());
          router.push("/pos/payment/history");
        }, 3000);
      } else {
        // confirmPayment가 rejected된 경우 에러 처리
        const payload = resultAction.payload as string;
        throw new Error(payload || "결제 확인에 실패했습니다.");
      }
    } catch (err: unknown) {
      console.error("결제 확인 실패:", err);
      
      // 에러 메시지 추출
      const errorMessage = err instanceof Error 
        ? err.message 
        : (typeof err === 'object' && err && 'message' in err)
          ? (err as ErrorWithMessage).message
          : "알 수 없는 오류가 발생했습니다.";
          
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <div className="max-w-md w-full">
        {isLoading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">결제 확인 중...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => setError(null)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        ) : isConfirmed ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-green-600 mb-4">
              결제가 완료되었습니다!
            </h1>
            <p className="text-gray-600">
              잠시 후 결제내역 페이지로 이동합니다...
            </p>
          </div>
        ) : (
          <div className="bg-white shadow-lg rounded-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              결제 확인
            </h1>
            <p className="text-gray-600 mb-6">
              결제를 확인하려면 아래 버튼을 클릭해주세요.
            </p>
            <button
              onClick={handleConfirmPayment}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              disabled={isLoading}
            >
              결제 확인하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// 메인 페이지 컴포넌트
const PaymentSuccessPage = () => {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
};

export default PaymentSuccessPage;