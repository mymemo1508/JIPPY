// @/features/dashboard/product/hooks/useProducts.ts
import { useState, useEffect, useCallback } from "react";
import { Product } from "@/features/dashboard/product/types/product";

export const useProducts = (storeId: number) => {
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product/${storeId}/select`);
      const json = await res.json();
      if (json.success) {
        setProducts(json.data);
      }
    } catch (error) {
      console.error(error);
    }
  }, [storeId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, fetchProducts };
};
