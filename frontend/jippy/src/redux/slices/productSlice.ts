// productSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ProductDetailResponse } from "@/redux/types/product";

interface ProductState {
  products: ProductDetailResponse[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  loading: false,
  error: null,
};

// productSlice.ts
export const createProduct = createAsyncThunk(
  'product/create',
  async ({ storeId, productData }: { storeId: number, productData: FormData }) => {
    const response = await fetch(`/api/product/${storeId}/create`, {
      method: 'POST',
      body: productData,  // Content-Type 헤더는 자동으로 설정됨
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || '상품 등록에 실패했습니다.');
    }
    
    return result;
  }
);

export const fetchProducts = createAsyncThunk(
  "product/fetchAll",
  async (storeId: number, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/product/${storeId}/select`
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || '상품 목록을 불러오는데 실패했습니다.');
      }

      return data.data || [];
    } catch {
      return rejectWithValue('상품 목록을 불러오는데 실패했습니다.');
    }
  }
);

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          state.products.push(action.payload.data);
        }
        state.error = null;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : '오류가 발생했습니다.';
      });
  },
});

export const { clearError } = productSlice.actions;
export default productSlice.reducer;