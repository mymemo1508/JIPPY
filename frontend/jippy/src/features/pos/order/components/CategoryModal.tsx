// components/category/CategoryModals.tsx
import { Button } from "@/features/common/components/ui/button";
import { Modal } from "@/features/common/components/ui/modal/Modal";
import { Edit, Trash } from "lucide-react";

interface CategoryModalsProps {
  isActionModalOpen: boolean;
  isCreateMode: boolean;
  isUpdateMode: boolean;
  editingCategory: { id: number; categoryName: string } | null;
  newCategoryName: string;
  updatedCategoryName: string;
  onCloseActionModal: () => void;
  onCloseCreateModal: () => void;
  onCloseUpdateModal: () => void;
  onCreateCategory: () => void;
  onUpdateCategory: () => void;
  onDeleteCategory: (id: number) => void;
  onNewCategoryNameChange: (value: string) => void;
  onUpdatedCategoryNameChange: (value: string) => void;
  onStartUpdate: () => void;
}

const CategoryModals = ({
  isActionModalOpen,
  isCreateMode,
  isUpdateMode,
  editingCategory,
  newCategoryName,
  updatedCategoryName,
  onCloseActionModal,
  onCloseCreateModal,
  onCloseUpdateModal,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  onNewCategoryNameChange,
  onUpdatedCategoryNameChange,
  onStartUpdate,
}: CategoryModalsProps) => {
  const getModalClassName = (modalType: "action" | "create" | "update") => {
    const baseClass = "w-[480px] max-h-fit rounded-2xl";
    if (modalType === "create") {
      return `${baseClass} bg-green-100`; // 추가 모달에 대한 스타일 예시
    }
    if (modalType === "update") {
      return `${baseClass} bg-blue-100`; // 수정 모달에 대한 스타일 예시
    }
    return baseClass;
  };

  return (
    <>
      <Modal
        isOpen={isActionModalOpen}
        onClose={onCloseActionModal}
        className={getModalClassName("action")}
      >
        <div className="bg-white p-6 rounded-2xl">
          <h2 className="text-lg font-bold">카테고리 관리</h2>
          <p className="mt-2">
            {editingCategory?.categoryName} 카테고리를 수정하거나 삭제할 수
            있습니다.
          </p>
          <div className="flex gap-4 justify-center mt-4">
            <Button onClick={onStartUpdate} variant="orangeBorder">
              <Edit className="w-4 h-4" /> 수정
            </Button>
            <Button
              onClick={() =>
                editingCategory && onDeleteCategory(editingCategory.id)
              }
              variant="danger"
            >
              <Trash className="w-4 h-4" /> 삭제
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isCreateMode}
        onClose={onCloseCreateModal}
        className={getModalClassName("create")}
      >
        <div className="bg-white p-8 rounded-2xl">
          <h2 className="text-xl font-bold mb-6">새 카테고리 추가</h2>
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => onNewCategoryNameChange(e.target.value)}
            className="w-full py-3 px-4 border border-gray-300 rounded-xl mb-6"
            placeholder="카테고리 이름 입력"
          />
          <div className="flex gap-4 justify-center w-full">
            <Button
              onClick={onCloseCreateModal}
              variant="orangeBorder"
              className="flex-1 py-3 rounded-full"
            >
              취소
            </Button>
            <Button
              onClick={onCreateCategory}
              variant="orange"
              className="flex-1 py-3 rounded-full"
            >
              추가
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isUpdateMode}
        onClose={onCloseUpdateModal}
        className={getModalClassName("update")}
      >
        <div className="bg-white p-8 rounded-2xl">
          <h2 className="text-xl font-bold mb-6">카테고리 수정</h2>
          <input
            type="text"
            value={updatedCategoryName}
            onChange={(e) => onUpdatedCategoryNameChange(e.target.value)}
            className="w-full py-3 px-4 border border-gray-300 rounded-xl mb-6"
            placeholder="새로운 카테고리 이름 입력"
          />
          <div className="flex gap-4 justify-center w-full">
            <Button
              onClick={onCloseUpdateModal}
              variant="orangeBorder"
              className="flex-1 py-3 rounded-full"
            >
              취소
            </Button>
            <Button
              onClick={onUpdateCategory}
              variant="orange"
              className="flex-1 py-3 rounded-full"
            >
              수정
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CategoryModals;
