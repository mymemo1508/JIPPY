import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";

export interface Shop {
  id: number;
  userOwnerId: number;
  name: string;
  address: string;
  openingDate: string;
  totalCash: number;
  businessRegistrationNumber: string;
  latitude: string;
  longitude: string;
}

interface ShopState {
  shops: Shop[];
  currentShop: Shop | null;
  isLoading: boolean;
  error: string | null;
}

// 매장 업데이트를 위한 인터페이스 추가
interface UpdateShopPayload {
  storeId: number;
  data: Partial<Shop>;
}

const initialState: ShopState = {
  shops: [],
  currentShop: null,
  isLoading: false,
  error: null,
};

export const createShop = createAsyncThunk(
  "shop/createShop",
  async (
    shopData: Omit<Shop, "id" | "totalCash">,
    { rejectWithValue, getState }
  ) => {
    try {
      const state = getState() as RootState;
      const accessToken = state.user.accessToken;

      if (!accessToken) {
        throw new Error("인증 토큰이 없습니다.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/store/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            ...shopData,
            totalCash: 0,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("매장 등록 실패");
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("매장 등록 중 오류 발생:", error);
      return rejectWithValue("매장 등록에 실패했습니다.");
    }
  }
);

export const fetchShop = createAsyncThunk(
  "shop/fetchUserShop",
  async (userId: number, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const accessToken = state.user.accessToken;

      if (!accessToken) {
        throw new Error("인증 토큰이 없습니다.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/list?ownerId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("매장 정보 조회 실패");
      }

      const jsonResponse = await response.json();

      if (!jsonResponse.success) {
        throw new Error("매장 정보 조회에 실패했습니다.");
      }

      const userShops = jsonResponse.data.filter(
        (shop: Shop) => shop.userOwnerId === userId
      );

      return userShops;
    } catch (error: unknown) {
      console.error("매장 정보 조회 중 오류 발생:", error);
      return rejectWithValue("매장 정보를 불러오지 못했습니다.");
    }
  }
);

export const updateShop = createAsyncThunk(
  "shop/updateShop",
  async (
    { storeId, data }: UpdateShopPayload,
    { rejectWithValue, getState }
  ) => {
    try {
      const state = getState() as RootState;
      const accessToken = state.user.accessToken;

      if (!accessToken) {
        throw new Error("인증 토큰이 없습니다.");
      }

      if (!storeId) {
        throw new Error("매장 ID가 없습니다.");
      }

      console.log("Updating shop:", { storeId, data }); // 디버깅용 로그

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/store/update/${storeId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        throw new Error(errorText || "매장 정보 업데이트 실패");
      }

      const responseData = await response.json();
      return responseData.data;
    } catch (error) {
      console.error("매장 정보 업데이트 중 오류 발생:", error);
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "매장 정보 업데이트에 실패했습니다."
      );
    }
  }
);

export const deleteShop = createAsyncThunk(
  "shop/deleteShop",
  async (shopId: number, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const accessToken = state.user.accessToken;

      if (!accessToken) {
        throw new Error("인증 토큰이 없습니다.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/store/delete/${shopId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("매장 삭제 실패");
      }

      const data = await response.json();
      return { shopId, data: data.data };
    } catch (error) {
      console.error("매장 삭제 중 오류 발생:", error);
      return rejectWithValue("매장 삭제에 실패했습니다.");
    }
  }
);

const shopSlice = createSlice({
  name: "shop",
  initialState,
  reducers: {
    setShops: (state, action: PayloadAction<Shop[]>) => {
      state.shops = action.payload;
      state.currentShop = action.payload.length > 0 ? action.payload[0] : null;
    },
    setCurrentShop: (state, action: PayloadAction<Shop>) => {
      state.currentShop = action.payload;
    },
    clearShopState: (state) => {
      state.shops = [];
      state.currentShop = null;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createShop.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createShop.fulfilled, (state, action: PayloadAction<Shop>) => {
        state.isLoading = false;
        state.error = null;
        state.currentShop = action.payload;
        state.shops.push(action.payload);
      })
      .addCase(createShop.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchShop.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchShop.fulfilled, (state, action: PayloadAction<Shop[]>) => {
        state.isLoading = false;
        state.error = null;
        state.shops = action.payload;
        state.currentShop = action.payload[0] || null;
      })
      .addCase(fetchShop.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateShop.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateShop.fulfilled, (state, action: PayloadAction<Shop>) => {
        state.isLoading = false;
        state.error = null;
        const index = state.shops.findIndex(
          (shop) => shop.id === action.payload.id
        );
        if (index !== -1) {
          state.shops[index] = action.payload;
        }
        if (state.currentShop?.id === action.payload.id) {
          state.currentShop = action.payload;
        }
      })
      .addCase(updateShop.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteShop.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteShop.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.shops = state.shops.filter(
          (shop) => shop.id !== action.payload.shopId
        );
        if (state.currentShop?.id === action.payload.shopId) {
          state.currentShop = state.shops.length > 0 ? state.shops[0] : null;
        }
      })
      .addCase(deleteShop.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setShops, setCurrentShop, clearShopState } = shopSlice.actions;

export default shopSlice.reducer;
