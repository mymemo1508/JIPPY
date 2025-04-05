// store/slices/orderSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface OrderItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

interface OrderState {
  items: OrderItem[];
  totalAmount: number;
  selectedPaymentMethod: "cash" | "qr" | null;
  orderId: string | null;
}

const initialState: OrderState = {
  items: [],
  totalAmount: 0,
  selectedPaymentMethod: null,
  orderId: null,
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<OrderItem>) => {
      const existingItem = state.items.find(
        item => item.productId === action.payload.productId
      );
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
      state.totalAmount = state.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
    },
    removeItem: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(item => item.productId !== action.payload);
      state.totalAmount = state.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ productId: number; quantity: number }>
    ) => {
      const item = state.items.find(
        item => item.productId === action.payload.productId
      );
      if (item) {
        item.quantity = action.payload.quantity;
        state.totalAmount = state.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      }
    },
    setPaymentMethod: (
      state,
      action: PayloadAction<"cash" | "qr" | null>
    ) => {
      state.selectedPaymentMethod = action.payload;
    },
    setOrderId: (state, action: PayloadAction<string>) => {
      state.orderId = action.payload;
    },
    clearOrder: (state) => {
      state.items = [];
      state.totalAmount = 0;
      state.selectedPaymentMethod = null;
      state.orderId = null;
    },
  },
});

export const {
  addItem,
  removeItem,
  updateQuantity,
  setPaymentMethod,
  setOrderId,
  clearOrder,
} = orderSlice.actions;

export default orderSlice.reducer;