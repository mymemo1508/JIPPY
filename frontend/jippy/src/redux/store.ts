import { configureStore } from "@reduxjs/toolkit";
import stockReducer from "./slices/stockSlice";
import userReducer from "./slices/userSlice";
import shopReducer from "./slices/shopSlice";
import productReducer from "./slices/productSlice";
import categoryReducer from "./slices/categorySlice";
import recipeReducer from "./slices/recipeSlice";
import chatReducer from "./slices/chatSlice";
import orderReducer from "./slices/orderSlice";
import paymentReducer from "./slices/paymentSlice";


export const store = configureStore({
  reducer: {
    user: userReducer,
    stock: stockReducer,
    shop: shopReducer,
    product: productReducer,
    category: categoryReducer,
    recipe: recipeReducer,
    chat: chatReducer,
    order: orderReducer,
    payment: paymentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["user/setUserToken"],
      },
    }),
    devTools: process.env.NODE_ENV !== "production", // ✅ DevTools 활성화
});
  
export function createStore(preloadedState = {}) {
  return configureStore({
    reducer: {
      stock: stockReducer,
    },
    preloadedState, // 서버에서 데이터를 받아 초기 상태 설정 가능
  });
}

export type AppStore = ReturnType<typeof createStore>;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;