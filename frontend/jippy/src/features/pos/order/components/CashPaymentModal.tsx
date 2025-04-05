"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/features/common/components/ui/dialog/dialog";
import { Button } from "@/features/common/components/ui/button";
import { useRouter } from "next/navigation";

// Payment request interface definition
// interface PaymentRequest {
//   storeId: number;
//   totalCost: number;
//   paymentType: "CASH";
//   productList: Array<{
//     productId: number;
//     quantity: number;
//   }>;
// }

interface CashPaymentModalProps {
  isOpen: boolean;
  totalAmount: number;
  onClose: () => void;
  onConfirm: (request: {
    storeId: number;
    totalCost: number;
    paymentType: "CASH";
    productList: Array<{
      productId: number;
      quantity: number;
    }>;
    receivedAmount: number; // 추가
  }) => Promise<void>;
  storeId: number;
  productList: Array<{
    productId: number;
    quantity: number;
  }>;
}

export const CashPaymentModal: React.FC<CashPaymentModalProps> = ({
  isOpen,
  totalAmount,
  onClose,
  onConfirm,
  storeId,
  productList,
}) => {
  const router = useRouter();

  // Manage received amount state
  const [receivedAmount, setReceivedAmount] = useState<number>(0);

  // Manage loading state
  const [isLoading, setIsLoading] = useState(false);

  // Calculate change
  const calculateChange = () => {
    return receivedAmount - totalAmount;
  };

  const handleConfirm = async () => {
    if (receivedAmount < totalAmount) {
      alert("입력하신 현금 금액이 총 주문 금액보다 부족합니다.");
      return;
    }

    try {
      setIsLoading(true);

      await onConfirm({
        storeId,
        totalCost: totalAmount,
        paymentType: "CASH",
        productList,
        receivedAmount, // 추가
      });

      setReceivedAmount(0);
      // onClose();
      router.push("/pos/payment/history");
    } catch (error) {
      console.error("Payment error:", error);
      alert("결제 처리 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // Modal close handler
  const handleClose = () => {
    // Reset received amount
    setReceivedAmount(0);
    // Close modal
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>현금 결제</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Total payment amount display */}
          <div className="flex justify-between items-center">
            <span>총 결제 금액:</span>
            <span className="font-bold">{totalAmount.toLocaleString()}원</span>
          </div>

          {/* Received amount input */}
          <div className="flex justify-between items-center">
            <span>받은 금액:</span>
            <div className="flex items-center">
              <input
                type="number"
                min={0}
                value={receivedAmount}
                onChange={(e) => setReceivedAmount(Number(e.target.value))}
                className="border rounded p-2 w-32 text-right"
                placeholder="받은 금액 입력"
                disabled={isLoading}
              />
              <span className="ml-2">원</span>
            </div>
          </div>

          {/* Change display */}
          <div className="flex justify-between items-center text-lg font-bold">
            <span>거스름돈:</span>
            <span
              className={`${
                calculateChange() >= 0 ? "text-orange-500" : "text-red-500"
              }`}
            >
              {calculateChange().toLocaleString()}원
            </span>
          </div>

          {/* Button group */}
          <div className="flex space-x-2">
            {/* Cancel button */}
            <Button
              variant="default"
              onClick={handleClose}
              className="w-1/2"
              disabled={isLoading}
            >
              취소
            </Button>

            {/* Payment confirmation button */}
            <Button
              variant="orange"
              onClick={handleConfirm}
              className="w-1/2"
              disabled={receivedAmount < totalAmount || isLoading}
            >
              {isLoading ? "처리 중..." : "결제 확인"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
