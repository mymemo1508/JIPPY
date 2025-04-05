import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PaymentState, PaymentConfirmRequest } from "@/features/pos/payment/types/payment";

const initialState: PaymentState = {
  loading: false,
  error: null,
  orderData: null
};

export const confirmPayment = createAsyncThunk(
  "payment/confirm",
  async (request: PaymentConfirmRequest, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payment/qrcode/confirm`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
          credentials: "include"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "결제 확인 중 오류가 발생했습니다.");
      }

      return data;
    } catch {
      return rejectWithValue("결제 확인 중 오류가 발생했습니다.");
    }
  }
);

export const cancelPayment = createAsyncThunk(
  "payment/cancel",
  async (paymentUUID: string, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payment/qrcode/cancel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ paymentUUID }),
          credentials: "include"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "결제 취소 중 오류가 발생했습니다.");
      }

      return data;
    } catch {
      return rejectWithValue("결제 취소 중 오류가 발생했습니다.");
    }
  }
);

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    setOrderData: (state, action) => {
      state.orderData = action.payload;
    },
    clearPaymentState: (state) => {
      state.orderData = null;
      state.error = null;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // 결제 확인
      .addCase(confirmPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmPayment.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(confirmPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // 결제 취소
      .addCase(cancelPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelPayment.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(cancelPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setOrderData, clearPaymentState, clearError } = paymentSlice.actions;
export default paymentSlice.reducer;