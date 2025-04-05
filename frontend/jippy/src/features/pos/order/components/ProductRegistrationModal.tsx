// components/ProductRegistrationModal.tsx
import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import { Modal } from "@/features/common/components/ui/modal/Modal";
import { Button } from "@/features/common/components/ui/button";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchProducts } from "@/redux/slices/productSlice";
import { fetchCategories } from "@/redux/slices/categorySlice";
import { X, ImagePlus, ArrowLeft } from "lucide-react";
import {
  ProductType,
  ProductSize,
  ProductDetailResponse,
  ProductBasicFormData,
  SizeRecipeData,
} from "@/redux/types/product";
import SizeRecipeForm from "./SizeRecipeForm";

interface ProductRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProductRegistrationModal: React.FC<ProductRegistrationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [storeId, setStoreId] = useState<string | null>(null);

  // 카테고리 관련 상태 가져오기
  const {
    categories,
    loading: categoryLoading,
    error: categoryError,
  } = useSelector((state: RootState) => {
    const categoriesState = state.category.categories;
    return {
      categories: categoriesState || [], // 이 부분도 수정 필요
      loading: state.category.loading,
      error: state.category.error,
    };
  });

  const [step, setStep] = useState<"basic" | "recipe">("basic");
  const [formData, setFormData] = useState<ProductBasicFormData>({
    name: "",
    categoryId: 0,
    type: ProductType.ICE,
    isAvailable: true,
  });
  const [sizeData, setSizeData] = useState<
    Partial<Record<ProductSize, SizeRecipeData>>
  >({});
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // 모달이 열릴 때 카테고리 목록 가져오기
  useEffect(() => {
    if (isOpen && storeId) {
      dispatch(fetchCategories(Number(storeId)));
      // console.log('현재 카테고리 목록:', categories);
    }
  }, [isOpen, storeId, dispatch]);

  // 모달이 열릴 때 폼 초기화
  useEffect(() => {
    if (isOpen) {
      setStep("basic");
      setFormData({
        name: "",
        categoryId: 0,
        type: ProductType.ICE,
        isAvailable: true,
      });
      setSizeData({});
      setImageFile(null);
      setImagePreview(null);
    }
  }, [isOpen]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleBasicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.categoryId === 0) {
      alert("카테고리를 선택해주세요.");
      return;
    }
    setStep("recipe");
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      categoryId: value ? parseInt(value) : 0,
    }));
  };

  const handleSizeDataSubmit = async (
    sizeData: Partial<Record<ProductSize, SizeRecipeData>>
  ) => {
    if (storeId) return;

    try {
      for (const [size, data] of Object.entries(sizeData)) {
        if (!data) continue;

        console.log("▶️ 처리 중인 사이즈:", size);
        console.log("📌 데이터:", data);

        // createProduct 데이터 준비
        const createProductData = {
          productCategoryId: formData.categoryId,
          storeId: Number(storeId),
          name: formData.name.trim(),
          price: data.price,
          status: formData.isAvailable,
          productType: ProductType[formData.type],
          productSize: ProductSize[parseInt(size)],
        };

        console.log("📝 요청 데이터:", createProductData);

        // FormData 생성
        const form = new FormData();

        // createProduct JSON을 Blob으로 변환하여 추가
        const createProductBlob = new Blob(
          [JSON.stringify(createProductData)],
          { type: "application/json" }
        );
        form.append("createProduct", createProductBlob);

        // 이미지 파일 추가
        if (imageFile) {
          form.append("image", imageFile);
        } else {
          // 빈 파일을 추가하여 기본 이미지가 사용되도록 함
          const emptyBlob = new Blob([], { type: "application/octet-stream" });
          form.append("image", emptyBlob, "empty.jpg");
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/product/${storeId}/create`,
          {
            method: "POST",
            body: form,
          }
        );

        const result = await response.json();

        console.log("✅ 상품 등록 응답:", result);

        if (result.code === 200 && result.success) {
          console.log("🛠 레시피 생성 시작...");

          // 상품 목록 조회
          const products = await dispatch(
            fetchProducts(Number(storeId))
          ).unwrap();
          console.log("조회된 상품 목록:", products);

          // 방금 생성한 상품 찾기 (이름과 카테고리로만 비교)
          const createdProduct = products.find(
            (product: ProductDetailResponse) =>
              product.name === formData.name.trim() &&
              product.productCategoryId === formData.categoryId
          );

          console.log("찾은 상품:", createdProduct);

          if (!createdProduct) {
            throw new Error("생성된 상품을 찾을 수 없습니다.");
          }

          // 레시피 등록
          const recipeResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/recipe/create`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                productId: createdProduct.id,
                updatedAt: new Date().toISOString(),
                ingredient: data.recipe,
              }),
            }
          );

          const recipeResult = await recipeResponse.json();
          console.log("🍽 레시피 등록 응답:", recipeResult);

          if (!recipeResponse.ok) {
            throw new Error("레시피 등록에 실패했습니다.");
          }
        } else {
          throw new Error(result.message || "상품 등록에 실패했습니다.");
        }
      }

      onClose();
    } catch (error) {
      console.error("❌ 상품 등록 실패:", error);
      if (error instanceof Error) {
        alert(`상품 등록 실패: ${error.message}`);
      } else {
        alert("상품 등록 중 알 수 없는 오류가 발생했습니다.");
      }
    }
  };

  const renderCategoryOptions = () => {
    if (categoryLoading) {
      return <option value="">로딩 중...</option>;
    }

    if (categoryError) {
      return <option value="">카테고리를 불러올 수 없습니다</option>;
    }

    if (!Array.isArray(categories) || categories.length === 0) {
      return <option value="">카테고리가 없습니다</option>;
    }

    return (
      <>
        <option value="">카테고리를 선택해주세요</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.categoryName}
          </option>
        ))}
      </>
    );
  };

  const renderBasicForm = () => (
    <form onSubmit={handleBasicSubmit}>
      {/* 이미지 업로드 */}
      <div className="mb-4">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <div
          className="relative w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          {imagePreview ? (
            <>
              <Image
                src={imagePreview}
                alt="상품 이미지"
                fill
                className="object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center text-gray-500">
              <ImagePlus className="w-12 h-12 mb-2" />
              <p>이미지 업로드</p>
            </div>
          )}
        </div>
      </div>

      {/* 기본 정보 입력 폼 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            상품명
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="상품명을 입력하세요"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            카테고리
          </label>
          <div className="relative">
            <select
              value={formData.categoryId || ""}
              onChange={handleCategoryChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
              style={{
                maxWidth: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {renderCategoryOptions()}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            상품 타입
          </label>
          <div className="flex gap-2">
            {Object.entries(ProductType)
              .filter(([key, value]) => !isNaN(Number(value)))
              .map(([key, value]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      type: value as ProductType,
                    }))
                  }
                  className={`flex-1 p-2 rounded transition-colors ${
                    formData.type === value
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {key}
                </button>
              ))}
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isAvailable"
            checked={formData.isAvailable}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                isAvailable: e.target.checked,
              }))
            }
            className="mr-2"
          />
          <label htmlFor="isAvailable" className="text-sm">
            판매 중
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="orangeBorder" onClick={onClose} type="button">
          취소
        </Button>
        <Button variant="orange" type="submit">
          다음
        </Button>
      </div>
    </form>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl w-full">
      <div className="p-6 relative overflow-hidden">
        <div className="flex items-center mb-4">
          {step === "recipe" && (
            <button
              onClick={() => setStep("basic")}
              className="mr-2 p-1 hover:bg-gray-100 rounded"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h2 className="text-xl font-bold">
            {step === "basic" ? "새 상품 등록" : "사이즈 및 레시피 등록"}
          </h2>
        </div>

        <div className="overflow-auto">
          {step === "basic" ? (
            renderBasicForm()
          ) : (
            <SizeRecipeForm
              productType={formData.type}
              sizeData={sizeData}
              onSubmit={handleSizeDataSubmit}
              onCancel={() => setStep("basic")}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ProductRegistrationModal;
