import { ProductSize, ProductType } from "@/redux/types/product";

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image?: string;
  size: ProductSize;
  type: ProductType;
}

export interface OrderItem extends Product {
  quantity: number;
}

export type PaymentMethod = "cash" | "qr";

export type PaymentType = "QRCODE" | "CASH";

export interface CashDenomination {
  fifty_thousand_won: number;
  ten_thousand_won: number;
  five_thousand_won: number;
  one_thousand_won: number;
  five_hundred_won: number;
  one_hundred_won: number;
  fifty_won: number;
  ten_won: number;
}
