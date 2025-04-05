'use client';

import { useRef } from 'react';
import { Provider } from 'react-redux';
import { createStore, AppStore } from './store';
import { setStockData } from './slices/stockSlice';

// StoreProvider를 named export에서 default export로 변경
export function StoreProvider({
  children,
  preloadedState
}: {
  children: React.ReactNode;
  preloadedState?: unknown;
}) {
  const storeRef = useRef<AppStore>();
  if (!storeRef.current) {
    storeRef.current = createStore();
    if (preloadedState) {
      storeRef.current.dispatch(setStockData(preloadedState));
    }
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}