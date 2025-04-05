"use client";

import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchCategories } from "@/redux/slices/categorySlice";
import { Button } from "@/features/common/components/ui/button";
import CategoryItem from "./CategoryItem";
import CategoryModals from "./CategoryModal";

interface CategoryListProps {
  selectedCategory: string;
  onCategorySelect: (categoryName: string, categoryId: number | -1) => void;
}

const CategoryList = ({
  selectedCategory,
  onCategorySelect,
}: CategoryListProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories } = useSelector((state: RootState) => state.category);

  // State
  const [storeId, setStoreId] = useState<string | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{
    id: number;
    categoryName: string;
  } | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(
    null
  );
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [updatedCategoryName, setUpdatedCategoryName] = useState("");
  const [touchStartTime, setTouchStartTime] = useState(0);

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

  const fetchCategoriesData = useCallback(async () => {
    if (storeId) {
      await dispatch(fetchCategories(Number(storeId)));
    }
  }, [dispatch, storeId]);

  useEffect(() => {
    fetchCategoriesData();
  }, [fetchCategoriesData]);

  const handleTouchStart = (category: { id: number; categoryName: string }) => {
    if (category.id === 0) return;
    setTouchStartTime(Date.now());
    handleLongPressStart(category);
  };

  const handleTouchEnd = () => {
    const touchDuration = Date.now() - touchStartTime;
    handleLongPressEnd();

    if (touchDuration < 1000) {
      setIsEditMode(false);
      setIsActionModalOpen(false);
      setEditingCategory(null);
    }
  };

  const handleLongPressStart = (category: {
    id: number;
    categoryName: string;
  }) => {
    if (category.id === 0) return;

    const timer = setTimeout(() => {
      setIsEditMode(true);
      setEditingCategory(category);
      setIsActionModalOpen(true);
    }, 1000);
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleCreateCategory = async () => {
    if (!storeId || !newCategoryName.trim()) return;

    // 중복 카테고리 체크
    const isDuplicateCategory = categories.some(
      (category) => category.categoryName.trim() === newCategoryName.trim()
    );

    if (isDuplicateCategory) {
      alert("이미 존재하는 카테고리 이름입니다.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/category/${storeId}/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ categoryName: newCategoryName.trim() }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to create category");
      }

      await fetchCategoriesData();
      setNewCategoryName("");
      setIsCreateMode(false);
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  const handleUpdateCategory = async () => {
    if (!storeId || !editingCategory || !updatedCategoryName.trim()) return;

    // 중복 카테고리 체크 (자기 자신은 제외)
    const isDuplicateCategory = categories.some(
      (category) =>
        category.id !== editingCategory.id &&
        category.categoryName.trim() === updatedCategoryName.trim()
    );

    if (isDuplicateCategory) {
      alert("이미 존재하는 카테고리 이름입니다.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/category/${storeId}/update/${editingCategory.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ categoryName: updatedCategoryName.trim() }),
        }
      );

      if (!response.ok) throw new Error("Failed to update category");

      await fetchCategoriesData();
      setIsUpdateMode(false);
      setIsActionModalOpen(false);
      setIsEditMode(false);
      setUpdatedCategoryName("");
      setEditingCategory(null);
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!storeId || categoryId === 0) return;

    try {
      // 카테고리 삭제 전 상품 존재 여부 확인 API 호출
      const checkProductsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/category/${storeId}/check-products/${categoryId}`
      );

      const result = await checkProductsResponse.json();

      // 상품이 있는 경우 삭제 차단
      if (result.hasProducts) {
        alert(`이 카테고리에는 상품이 있어 삭제할 수 없습니다.`);
        return;
      }

      // 상품이 없으면 삭제 진행
      const deleteResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/category/${storeId}/delete/${categoryId}`,
        { method: "DELETE" }
      );

      if (!deleteResponse.ok) {
        throw new Error("카테고리 삭제에 실패했습니다.");
      }

      await fetchCategoriesData();
      setIsActionModalOpen(false);
      setIsEditMode(false);
    } catch (error) {
      console.error("Error deleting category:", error);
      alert(
        `카테고리 삭제 중 오류가 발생했습니다: ${(error as Error).message}`
      );
    }
  };

  const handleCategoryClick = (category: {
    id: number;
    categoryName: string;
  }) => {
    if (isEditMode) {
      setIsEditMode(false);
      setIsActionModalOpen(false);
      setEditingCategory(null);
    }
    if (category.id === 0) {
      onCategorySelect(category.categoryName, -1);
    } else {
      onCategorySelect(category.categoryName, category.id);
    }
  };

  // Only show "전체" category and additional categories if currentShopId exists
  const displayCategories = storeId
    ? [{ id: 0, categoryName: "전체" }, ...categories]
    : [{ id: 0, categoryName: "전체" }];

  return (
    <>
      <div className="w-full overflow-x-auto">
        <div className="w-full min-w-0">
          <div className="flex gap-[12px] no-scrollbar">
            {displayCategories.map((category) => (
              <CategoryItem
                key={category.id}
                id={category.id}
                name={category.categoryName}
                isSelected={selectedCategory === category.categoryName}
                isEditMode={isEditMode}
                onSelect={() => handleCategoryClick(category)}
                onLongPress={() => handleTouchStart(category)}
                onPressEnd={handleTouchEnd}
              />
            ))}
            <Button
              onClick={() => setIsCreateMode(true)}
              variant="orangeBorder"
              className="w-[85px] h-[50px] rounded-[15px] font-semibold text-xl flex-shrink-0 mt-0"
            >
              +
            </Button>
          </div>
        </div>
      </div>

      <CategoryModals
        isActionModalOpen={isActionModalOpen}
        isCreateMode={isCreateMode}
        isUpdateMode={isUpdateMode}
        editingCategory={editingCategory}
        newCategoryName={newCategoryName}
        updatedCategoryName={updatedCategoryName}
        onCloseActionModal={() => {
          setIsActionModalOpen(false);
          setIsEditMode(false);
          setEditingCategory(null);
        }}
        onCloseCreateModal={() => {
          setIsCreateMode(false);
          setNewCategoryName("");
        }}
        onCloseUpdateModal={() => {
          setIsUpdateMode(false);
          setUpdatedCategoryName("");
          setEditingCategory(null);
        }}
        onCreateCategory={handleCreateCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
        onNewCategoryNameChange={setNewCategoryName}
        onUpdatedCategoryNameChange={setUpdatedCategoryName}
        onStartUpdate={() => {
          setIsUpdateMode(true);
          setUpdatedCategoryName(editingCategory?.categoryName || "");
          setIsActionModalOpen(false);
        }}
      />
    </>
  );
};

export default CategoryList;
