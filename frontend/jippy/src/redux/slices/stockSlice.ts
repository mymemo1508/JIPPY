import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// 초기 상태를 unknown[] 타입의 배열로 설정
const initialState: unknown = [];

const stockSlice = createSlice({
  name: "stock",
  initialState,
  reducers: {
    setStockData: (state, action: PayloadAction<unknown>) => {
      return action.payload; // 상태를 새로운 unknown[] 데이터로 교체
    },
  },
});

export const { setStockData } = stockSlice.actions;
export default stockSlice.reducer;
