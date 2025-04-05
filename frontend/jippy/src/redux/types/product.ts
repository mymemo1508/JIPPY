// redux/types/product.ts
export enum ProductType {
    ICE = 1,
    HOT = 2,
    EXTRA = 3
  }
  
  export enum ProductSize {
    S = 1,
    M = 2,
    L = 3,
    F = 4
  }
  
  export const ProductTypeLabel: Record<ProductType, string> = {
    [ProductType.ICE]: 'ICE',
    [ProductType.HOT]: 'HOT',
    [ProductType.EXTRA]: 'EXTRA'
  };
  
  export const ProductSizeLabel: Record<ProductSize, string> = {
    [ProductSize.S]: 'S',
    [ProductSize.M]: 'M',
    [ProductSize.L]: 'L',
    [ProductSize.F]: 'F'
  };
  
  export const AVAILABLE_SIZES = {
    [ProductType.HOT]: [ProductSize.S, ProductSize.M, ProductSize.L],
    [ProductType.ICE]: [ProductSize.S, ProductSize.M, ProductSize.L],
    [ProductType.EXTRA]: [ProductSize.F]
  } as const;
  
  // types/product.ts에 추가
  export interface ProductState {
    name: string;
    category: string | number;  // productCategoryId와 호환되도록
    selectedType: ProductType;
    size: ProductSize;
    price: number;
    isActive: boolean;
  }

  export interface ProductBasicFormData {
    name: string;
    categoryId: number;
    type: ProductType;
    isAvailable: boolean;
  }

  export interface ProductFormData {
    name: string;
    price: number;
    productSize: ProductSize;
    productType: ProductType;
    status: boolean;
    storeId: number;
    productCategoryId: number;
    image?: File | null;
  }
  
  export interface SizeRecipeData {
    price: number;
    recipe: {
      name: string;
      amount: number;
      unit: string;
    }[];
  }
  
  export interface ProductRegistrationData extends ProductFormData {
    sizes: Partial<Record<ProductSize, SizeRecipeData>>;
  }

  // Recipe 인터페이스 추가
  export interface Recipe {
    id: number;
    productId: number;
    storeId: number;
    name: string;
    description?: string;
    quantity: number;
    unit: string;
  }
  
  // ApiResponse 인터페이스도 필요해 보입니다
  export interface ApiResponse<T> {
    data: T;
    message?: string;
    code: number;   
    success: boolean;
  }
  
  export interface ProductFormData {
    name: string;
    price: number;
    productSize: ProductSize;
    productType: ProductType;
    status: boolean;
    storeId: number;
    productCategoryId: number;
    image?: File | null;
  }
  
  export interface ProductDetailResponse {
    id: number;
    productCategoryId: number;
    storeId: number;
    name: string;
    price: number;
    status: boolean;
    image: string;
    productType: ProductType;
    productSize: ProductSize;
  }
  