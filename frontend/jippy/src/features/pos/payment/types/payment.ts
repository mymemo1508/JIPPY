import { ProductSize, ProductType } from "@/redux/types/product";

export interface PaymentState {
  loading: boolean;
  error: string | null;
  orderData: OrderData | null;
}

export interface OrderData {
  totalAmount: number;
  orderName: string;
  customerName: string;
  storeId: number;
  products: Array<{
    id: number;
    name: string;
    quantity: number;
    type: ProductType;
    size: ProductSize;
  }>;
}

export interface PaymentConfirmRequest {
  storeId: number;
  totalCost: number;
  paymentType: "QRCODE";
  productList: Array<{
    productId: number;
    quantity: number;
  }>;
  orderId: string;
  paymentKey: string;
  amount: number;
}

export interface Product {
  id: string | number;
  quantity: number;
}

export interface ConfirmQrCodePaymentRequest {
  // ConfirmPaymentRequest 상속 필드
  storeId: number;
  totalCost: number;
  paymentType: "QRCODE";
  productList: Product[];

  // ConfirmQrCodePaymentRequest 추가 필드
  orderId: string;
  paymentKey: string;
  amount: number;
}

// features/payment/types/cash.ts
export interface CashDenominations {
  fifty_thousand_won: number;
  ten_thousand_won: number;
  five_thousand_won: number;
  one_thousand_won: number;
  five_hundred_won: number;
  one_hundred_won: number;
  fifty_won: number;
  ten_won: number;
}

export interface CashPaymentRequest {
  storeId: number;
  totalCost: number;
  paymentType: "CASH";
  productList: Array<{
    productId: number;
    quantity: number;
  }>;
  cashRequest: CashDenominations;
}

export interface CashCancelRequest {
  paymentUUIDRequest: {
    storeId: number;
    paymentUUID: string;
  };
  cashRequest: CashDenominations;
}
