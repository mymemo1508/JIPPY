"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchProducts } from "@/redux/slices/productSlice";
import { ProductDetailResponse } from "@/redux/types/product";
// import ProductRegistrationModal from "./ProductRegistrationModal";
import ProductOptionModal from "./ProductOptionModal";
// import { Plus } from "lucide-react";
import CategoryList from "./CategoryList";

interface ProductGridProps {
  onProductSelect?: (product: ProductDetailResponse) => void;
  onAddProduct?: (product: ProductDetailResponse) => void;
  showAddButton?: boolean;
}

const ProductGrid = ({
  onProductSelect,
  onAddProduct,
}: // showAddButton = true,
ProductGridProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<
    ProductDetailResponse[] | null
  >(null);
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | -1>(-1);
  // const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const DEFAULT_IMAGE_PATH = "/images/ProductPlaceholder.png";

  const { products, loading, error } = useSelector(
    (state: RootState) => state.product
  );

  useEffect(() => {
    if (typeof document !== "undefined") {
      const storeIdFromCookie =
        document.cookie
          .split("; ")
          .find((cookie) => cookie.startsWith("selectStoreId="))
          ?.split("=")[1] || null;

      setStoreId(storeIdFromCookie);
    }
  }, []);

  useEffect(() => {
    if (storeId) {
      dispatch(fetchProducts(Number(storeId)));
    }
  }, [dispatch, storeId]);

  const handleCategorySelect = (
    categoryName: string,
    categoryId: number | -1
  ) => {
    setSelectedCategory(categoryName);
    setSelectedCategoryId(categoryId);
  };

  // 상품 그룹화 로직
  const groupedProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];

    const groups: { [key: string]: ProductDetailResponse[] } = {};
    products.forEach((product) => {
      if (!groups[product.name]) {
        groups[product.name] = [];
      }
      groups[product.name].push(product);
    });

    return Object.values(groups).map((variants) => ({
      ...variants[0], // Only using the first variant
      variants: variants,
    }));
  }, [products]);

  const handleProductClick = (
    product: ProductDetailResponse & { variants: ProductDetailResponse[] }
  ) => {
    if (product.variants.length === 1) {
      if (onProductSelect) onProductSelect(product.variants[0]);
      if (onAddProduct) onAddProduct(product.variants[0]);
      return;
    }

    setSelectedProduct(product.variants);
    setIsOptionModalOpen(true);
  };

  const handleOptionSelect = (selectedOption: ProductDetailResponse) => {
    if (!selectedOption) return;
    if (onAddProduct) onAddProduct(selectedOption);
    setIsOptionModalOpen(false);
    setSelectedProduct(null);
  };

  if (!storeId) return <div>매장을 선택해주세요.</div>;
  if (loading)
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-full text-red-500">
        {error}
      </div>
    );

  const filteredProducts =
    selectedCategoryId === -1
      ? groupedProducts
      : groupedProducts.filter(
          (product) => product.productCategoryId === selectedCategoryId
        );

  return (
    <div className="h-full flex flex-col">
      <div className="flex-none bg-white p-4 border-b border-r">
        <div className="px-4">
          <CategoryList
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-4 gap-4 p-4">
          {filteredProducts.map((item) => (
            <div
              key={item.id}
              onClick={() => handleProductClick(item)}
              className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="relative w-full h-32 bg-gray-200 rounded-lg mb-2">
                <Image
                  src={
                    item.image &&
                    (item.image.startsWith("http") ||
                      item.image.startsWith("/"))
                      ? item.image
                      : DEFAULT_IMAGE_PATH
                  }
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = DEFAULT_IMAGE_PATH;
                  }}
                />
              </div>
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-gray-600">{item.price.toLocaleString()}원</p>
              {!item.status && (
                <span className="inline-block mt-2 px-2 py-1 text-sm bg-red-100 text-red-800 rounded">
                  품절
                </span>
              )}
            </div>
          ))}

          {filteredProducts.length === 0 && (
            <div className="col-span-4 text-center py-8 text-gray-500">
              <p>이 카테고리에 등록된 상품이 없습니다.</p>
            </div>
          )}

          {/* {showAddButton && (
            <div
              onClick={() => setIsRegistrationModalOpen(true)}
              className="bg-white rounded-lg shadow-md p-4 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-12 h-12 text-gray-500" />
            </div>
          )} */}
        </div>
      </div>

      {selectedProduct && (
        <ProductOptionModal
          isOpen={isOptionModalOpen}
          onClose={() => {
            setIsOptionModalOpen(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          onSelect={handleOptionSelect}
        />
      )}

      {/* <ProductRegistrationModal
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
      /> */}
    </div>
  );
};

export default ProductGrid;
