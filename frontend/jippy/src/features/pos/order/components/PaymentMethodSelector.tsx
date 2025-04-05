"use client";

import React from "react";
import { Button } from "@/features/common/components/ui/button";
import { PaymentMethod } from "@/features/pos/order/types/pos";

interface PaymentMethodSelectorProps {
  paymentMethod: PaymentMethod | null;
  onSelectPaymentMethod: (method: PaymentMethod) => void;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  paymentMethod,
  onSelectPaymentMethod,
}) => {
  return (
    <div className="flex space-x-2 mb-4">
      <Button
        variant={paymentMethod === "cash" ? "orange" : "default"}
        className="w-1/2"
        onClick={() => onSelectPaymentMethod("cash")}
      >
        현금
      </Button>
      <Button
        variant={paymentMethod === "qr" ? "orange" : "default"}
        className="w-1/2"
        onClick={() => onSelectPaymentMethod("qr")}
      >
        QR
      </Button>
    </div>
  );
};
