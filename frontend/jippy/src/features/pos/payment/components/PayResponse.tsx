"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/features/common/components/ui/card/Card";
import { useAppDispatch } from "@/redux/hooks";
import { clearPaymentState } from "@/redux/slices/paymentSlice";

interface PaymentResponseProps {
  paymentKey: string;
  orderId: string;
  amount: string;
  paymentDetail: {
    totalCost: number;
    createdAt: string;
    paymentType: string;
    paymentStatus: string;
    buyProduct: Array<{
      productId: number;
      productName: string;
      productCategoryId: number;
      productQuantity: number;
      price: number;
    }>;
    uuid: string;
  } | null;
}

const PaymentResponseComponent = ({ 
  paymentDetail
}: PaymentResponseProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isRecording] = useState(false);

  useEffect(() => {
    if (paymentDetail) {
      dispatch(clearPaymentState());
      localStorage.removeItem("orderData");
      
      setTimeout(() => {
        router.push("/order");
      }, 5000);
    }
  }, [paymentDetail, dispatch, router]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 text-center text-green-600">
            {isRecording ? "결제 내역을 기록하는 중..." : "결제가 완료되었습니다"}
          </h2>
          
          {paymentDetail && (
            <div className="space-y-4">
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">결제 정보</h3>
                <p className="text-gray-600">결제 수단: {paymentDetail.paymentType}</p>
                <p className="text-gray-600">결제 금액: {paymentDetail.totalCost.toLocaleString()}원</p>
                <p className="text-gray-600">결제 시간: {new Date(paymentDetail.createdAt).toLocaleString()}</p>
                <p className="text-gray-600">결제 상태: {paymentDetail.paymentStatus}</p>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">주문 상품</h3>
                <div className="space-y-2">
                  {paymentDetail.buyProduct.map((product, index) => (
                    <div key={index} className="flex justify-between text-gray-600">
                      <span>{product.productName} x {product.productQuantity}</span>
                      <span>{(product.price * product.productQuantity).toLocaleString()}원</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <p className="text-sm text-gray-500 mt-4 text-center">5초 후 자동으로 이동합니다...</p>
        </div>
      </Card>
    </div>
  );
};

export default PaymentResponseComponent;