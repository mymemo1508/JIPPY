import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface StockUnit {
  stockUnitSize: string;
  stockUnit: string;
  stockCount: number;
}

export interface StockItem {
  stockName: string;
  stockTotalValue: number;
  stock: StockUnit[];
}

const initialState: StockItem[] = [];

const stockDashSlice = createSlice({
  name: "stock",
  initialState,
  reducers: {
    setStockData: (state, action: PayloadAction<StockItem[]>) => {
      return action.payload;
    },
  },
});

export const { setStockData } = stockDashSlice.actions;
export default stockDashSlice.reducer;