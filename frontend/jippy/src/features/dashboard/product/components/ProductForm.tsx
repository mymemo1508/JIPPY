// @/features/dashboard/product/components/ProductForm.tsx
"use client";
import React, { useState, useEffect, ChangeEvent } from "react";
import RecipeForm from "./RecipeForm";

interface Category {
  id: number;
  categoryName: string;
}

interface ProductItem {
  id: number;
  storeId: number;
  productCategoryId: number;
  name: string;
  price: number;
  status: boolean;
  image: string;
  productType?: "ICE" | "HOT" | "EXTRA";
  productSize?: "S" | "M" | "L" | "F";
  totalSold?: number;
}

interface ProductFormProps {
  mode: "create" | "edit";
  productData?: ProductItem;
  onClose: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  mode,
  productData,
  onClose,
}) => {
  const [product, setProduct] = useState<ProductItem>({
    id: productData?.id || 0,
    storeId: productData?.storeId || 1,
    productCategoryId: productData?.productCategoryId || 0,
    name: productData?.name || "",
    price: productData?.price || 0,
    status: productData?.status ?? true,
    image: productData?.image || "",
    productType: productData?.productType || "ICE",
    productSize: productData?.productSize || "S",
    totalSold: productData?.totalSold || 0,
  });

  // 카테고리 관리
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState<string>("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/category/${product.storeId}/select`
        );
        const json = await response.json();
        if (json.success) {
          setCategories(json.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, [product.storeId]);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      // 카테고리 생성 API (예시)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/category/${product.storeId}/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            categoryName: newCategoryName.trim(),
            storeId: product.storeId,
          }),
        }
      );
      const json = await response.json();
      if (json.success) {
        alert("새 카테고리가 추가되었습니다.");
        // 카테고리 목록 갱신
        const response2 = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/category/${product.storeId}/select`
        );
        const json2 = await response2.json();
        if (json2.success) {
          setCategories(json2.data);
        }
        setNewCategoryName("");
      } else {
        alert("카테고리 추가에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [createdProductId, setCreatedProductId] = useState<number | null>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setProduct({ ...product, image: previewUrl });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const storeIdStr = product.storeId.toString();
    const url =
      mode === "create"
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/product/${storeIdStr}/create`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/product/${storeIdStr}/update/${product.id}`;

    const formData = new FormData();
    if (mode === "create") {
      formData.append(
        "createProduct",
        new Blob(
          [
            JSON.stringify({
              productCategoryId: product.productCategoryId,
              storeId: product.storeId,
              name: product.name,
              price: product.price,
              status: product.status,
              productType: product.productType,
              productSize: product.productSize,
            }),
          ],
          { type: "application/json" }
        )
      );
    } else {
      formData.append(
        "productUpdateRequest",
        new Blob(
          [
            JSON.stringify({
              productCategoryId: product.productCategoryId,
              name: product.name,
              price: product.price,
              status: product.status,
              productType: product.productType,
              productSize: product.productSize,
            }),
          ],
          { type: "application/json" }
        )
      );
    }
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const response = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        body: formData,
      });
      const jsonResponse = await response.json();
      if (jsonResponse.success) {
        if (mode === "create") {
          alert("상품이 등록되었습니다. 밑으로 가서 레시피를 등록하세요.");
          const newId = jsonResponse.data?.id;
          if (newId) {
            setCreatedProductId(newId);
            setProduct((prev) => ({ ...prev, id: newId }));
          } else {
            // product id가 응답에 없다면, 제품 목록에서 등록된 상품 찾기
            try {
              const listRes = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/product/${product.storeId}/select`
              );
              const listJson = await listRes.json();
              if (listJson.success && Array.isArray(listJson.data)) {
                const found = listJson.data.find(
                  (p: ProductItem) =>
                    p.name === product.name &&
                    p.price === product.price &&
                    p.productCategoryId === product.productCategoryId
                );
                if (found && found.id) {
                  setCreatedProductId(found.id);
                  setProduct((prev) => ({ ...prev, id: found.id }));
                } else {
                  alert("상품 등록 후 새로 생성된 제품을 찾을 수 없습니다.");
                  return;
                }
              }
            } catch (error) {
              console.error("Error fetching product list:", error);
              return;
            }
          }
          // 등록 후 레시피 폼을 계속 보여줍니다.
        } else {
          alert("상품이 수정되었습니다.");
          onClose();
          window.location.reload();
        }
      } else {
        alert("상품 등록/수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="space-y-5 bg-white p-6 rounded-xl shadow-lg"
      >
        {/* 상품명 입력 */}
        <div>
          <label className="text-gray-600 text-sm font-medium">상품명</label>
          <input
            type="text"
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F27B39] transition-all"
            required
          />
        </div>

        {/* 가격 입력 */}
        <div>
          <label className="text-gray-600 text-sm font-medium">가격</label>
          <input
            type="number"
            value={product.price}
            onChange={(e) =>
              setProduct({ ...product, price: parseInt(e.target.value) })
            }
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F27B39] transition-all"
            required
          />
        </div>

        {/* 상품 타입 선택 */}
        <div>
          <label className="text-gray-600 text-sm font-medium">상품 타입</label>
          <select
            value={product.productType}
            onChange={(e) =>
              setProduct({
                ...product,
                productType: e.target.value as "ICE" | "HOT" | "EXTRA",
              })
            }
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F27B39] transition-all"
          >
            <option value="ICE">ICE</option>
            <option value="HOT">HOT</option>
            <option value="EXTRA">EXTRA</option>
          </select>
        </div>

        {/* 상품 사이즈 선택 */}
        <div>
          <label className="text-gray-600 text-sm font-medium">
            상품 사이즈
          </label>
          <select
            value={product.productSize}
            onChange={(e) =>
              setProduct({
                ...product,
                productSize: e.target.value as "S" | "M" | "L" | "F",
              })
            }
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F27B39] transition-all"
          >
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="F">F</option>
          </select>
        </div>

        {/* 상품 카테고리 선택 */}
        <div>
          <label className="text-gray-600 text-sm font-medium">
            상품 카테고리
          </label>
          <select
            value={product.productCategoryId}
            onChange={(e) =>
              setProduct({
                ...product,
                productCategoryId: parseInt(e.target.value),
              })
            }
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F27B39] transition-all"
          >
            <option value={0}>-- 선택하세요 --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.categoryName}
              </option>
            ))}
          </select>

          {/* 카테고리 추가 */}
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              placeholder="새 카테고리명"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="border border-gray-300 p-3 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-[#F27B39] transition-all"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="bg-[#F27B39] text-white px-4 py-3 rounded-lg shadow-md hover:bg-[#d96b32] transition-all"
            >
              추가
            </button>
          </div>
        </div>

        {/* 이미지 업로드 */}
        <div>
          <label className="text-gray-600 text-sm font-medium">
            상품 이미지 첨부
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F27B39] transition-all"
            required={mode === "create"}
          />
          {imageFile && (
            <div className="mt-2">
              <img
                src={product.image}
                alt="미리보기"
                className="max-h-40 object-contain border border-gray-200 rounded-lg shadow-sm"
              />
            </div>
          )}
        </div>

        {/* 판매 상태 체크박스 */}
        <div className="flex items-center gap-3">
          <label className="text-gray-600 text-sm font-medium">판매 상태</label>
          <input
            type="checkbox"
            checked={product.status}
            onChange={(e) =>
              setProduct({ ...product, status: e.target.checked })
            }
            className="w-5 h-5 accent-[#F27B39] transition-all"
          />
        </div>

        {/* 등록 버튼 */}
        <button
          type="submit"
          className="w-full bg-[#F27B39] text-white px-5 py-3 rounded-lg shadow-md hover:bg-[#d96b32] transition-all"
        >
          {mode === "create" ? "등록" : "수정"}
        </button>
      </form>

      {(mode === "edit" || (mode === "create" && createdProductId)) && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">레시피 등록/수정</h3>
          <RecipeForm
            productId={mode === "create" ? createdProductId! : product.id}
            mode={mode}
          />
        </div>
      )}
    </>
  );
};

export default ProductForm;
