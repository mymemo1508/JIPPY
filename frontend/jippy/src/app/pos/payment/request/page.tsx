"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import PaymentRequestComponent from "@/features/pos/payment/components/PayRequest";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setOrderData } from "@/redux/slices/paymentSlice";

const PaymentRequestPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { orderData } = useAppSelector((state) => state.payment);

  useEffect(() => {
    if (!orderData) {
      // Redux에 데이터가 없으면 localStorage에서 확인
      const savedOrderData = localStorage.getItem("orderData");
      if (savedOrderData) {
        try {
          dispatch(setOrderData(JSON.parse(savedOrderData)));
        } catch (e) {
          console.error("Error parsing saved order data:", e);
          router.push("/order");
        }
      } else {
        router.push("/order");
      }
    }
  }, [orderData, dispatch, router]);

  if (!orderData) {
    return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>;
  }

  return (
    <div className="h-full overflow-hidden justify-center items-center">
      <PaymentRequestComponent />
    </div>
  );
};

export default PaymentRequestPage;