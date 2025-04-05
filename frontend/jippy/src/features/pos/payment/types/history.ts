// 구매 상품 정보
export interface BuyProduct {
  productId: number;
  productName: string;
  productCategoryId: number;
  productQuantity: number;
  price: number;
}

// 결제 내역 기본 정보
export interface PaymentHistoryItem {
  createdAt: string;
  paymentStatus: string;
  paymentType: string;
  totalCost: number;
  uuid: string;
}

// 결제 내역 상세 정보
export interface PaymentHistoryDetail extends PaymentHistoryItem {
  buyProduct: BuyProduct[];
}

// API 응답 타입
export interface ApiResponse<T> {
  code: number;
  success: boolean;
  data: T;
  message: string;
}

// 결제 상세 조회 요청 타입
export interface PaymentDetailRequest {
  storeId: number;
  paymentUUID: string;
}

// 결제 상태 타입
export type PaymentStatus =
  | "success" // 결제 성공
  | "pending" // 결제 대기
  | "cancel" // 결제 취소
  | "failed"; // 결제 실패

// 결제 타입 타입
export type PaymentType =
  | "credit_card" // 신용카드
  | "bank_transfer" // 계좌이체
  | "virtual_account" // 가상계좌
  | "cash" // 현금 결제
  | "mobile_payment"; // 모바일 결제
