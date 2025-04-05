"use client";

import React, { useState } from "react";
import { Edit2, Trash2 } from "lucide-react";
import ProductForm from "@/features/dashboard/product/components/ProductForm";

interface ProductItem {
  id: number;
  storeId: number;
  productCategoryId: number;
  name: string;
  price: number;
  status: boolean;
  image: string;
}

interface ProductTableProps {
  productData: ProductItem[]; // ✅ Redux 대신 Props로 데이터 받음
}

const ProductTable: React.FC<ProductTableProps> = ({ productData }) => {
  const [showFormModal, setShowFormModal] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(
    null
  );

  const handleDelete = async (storeId: number, productId: number) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/product/${storeId}/delete/${productId}`,
          {
            method: "DELETE",
          }
        );
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText);
        }
        const jsonResponse = await response.json();
        if (jsonResponse.success) {
          alert("상품이 삭제되었습니다.");
          window.location.reload(); // ✅ 삭제 후 새로고침 (리렌더링 유도)
        } else {
          alert("상품 삭제에 실패했습니다.");
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("상품 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  const openCreateModal = () => {
    setFormMode("create");
    setSelectedProduct(null);
    setShowFormModal(true);
  };

  const openEditModal = (product: ProductItem) => {
    setFormMode("edit");
    setSelectedProduct(product);
    setShowFormModal(true);
  };

  const closeModal = () => {
    setShowFormModal(false);
  };

  return (
    <div className="w-full">
      {/* 상단 탭 및 버튼 영역 */}
      <div className="flex justify-between items-center mb-6">
        {/* 왼쪽 레이블 */}
        <div className="flex gap-2">
          <div className="flex items-center border-b pb-2">
            <h2 className="text-2xl font-bold" style={{ color: "#F27B39" }}>
              상품
            </h2>
          </div>
        </div>

        {/* 오른쪽 버튼 */}
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-base font-medium shadow-md transition hover:bg-gray-200"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          상품 등록
        </button>
      </div>

      {/* 테이블 컨테이너 */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <div
          className="min-w-full"
          style={{ maxHeight: "300px", overflowY: "auto" }}
        >
          <table className="w-full table-fixed">
            <thead className="bg-orange-50 sticky top-0 z-10">
              <tr>
                <th className="p-2 text-left border-b w-10">번호</th>
                <th className="p-2 text-left border-b w-32">상품명</th>
                <th className="p-2 text-left border-b w-20">가격</th>
                <th className="p-2 text-left border-b w-20">상태</th>
                <th className="p-2 text-left border-b w-28">이미지</th>
                <th className="p-2 text-left border-b w-32">수정/삭제</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(productData) && productData.length > 0 ? (
                productData.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-2 border-b">{index + 1}</td>
                    <td className="p-2 border-b">{item.name}</td>
                    <td className="p-2 border-b">
                      {item.price.toLocaleString()}원
                    </td>
                    <td className="p-2 border-b">
                      {item.status ? "판매중" : "판매중지"}
                    </td>
                    <td className="p-2 border-b">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </td>
                    <td className="p-2 border-b">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.storeId, item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-4 text-gray-500 text-base"
                  >
                    상품 데이터가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 상품 등록/수정 모달 */}
      {showFormModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 overflow-y-auto">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={closeModal}
          ></div>
          <div className="bg-white p-4 rounded shadow-lg z-10 w-full max-w-[600px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold" style={{ color: "#F27B39" }}>
                {formMode === "create" ? "상품 등록" : "상품 수정"}
              </h2>
              <button onClick={closeModal} className="text-gray-500 text-2xl">
                &times;
              </button>
            </div>
            <ProductForm
              mode={formMode}
              productData={selectedProduct || undefined}
              onClose={closeModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductTable;
