// @/features/dashboard/product/type/product.ts
export type Product = {
    id: number;
    storeId: number;
    productCategoryId: number;
    name: string;
    price: number;
    status: boolean;
    image: string;
    productType: 'ICE' | 'HOT' | 'EXTRA';
    productSize: 'S' | 'M' | 'L' | 'F';
    totalSold?: number;
  };
  
  export type RecipeIngredient = {
    name: string;
    amount: number;
    unit: string;
  };
  
  export type Recipe = {
    productId: number;
    updatedAt: string;
    ingredient: RecipeIngredient[];
  };
  