// @/features/dashboard/product/hooks/useProductSales.ts
import { useState, useEffect } from 'react';

type MonthlySalesData = {
  [month: string]: {
    productId: number;
    productName: string;
    soldCount: number;
  }[];
};

export const useProductSales = (storeId: number) => {
  const [salesData, setSalesData] = useState<MonthlySalesData>({});

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product/${storeId}/fetch/month`);
        const json = await res.json();
        if (json.success) {
          setSalesData(json.data.productMonthlySold);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchSales();
  }, [storeId]);

  return { salesData };
};
