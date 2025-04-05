"use client";

import { Notice } from "../types/notifications";

interface NoticeDetailModalProps {
  notice: Notice;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (notice: Notice) => void;
  onDelete: (noticeId: number) => void;
}

const NoticeDetailModal = ({
  notice,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: NoticeDetailModalProps) => {
  if (!isOpen) return null;

  const handleDelete = () => {
    if (confirm("정말 삭제하시겠습니까?")) {
      onDelete(notice.noticeId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[600px] max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-start p-6 pb-0">
          <h2 className="text-xl font-semibold text-[#3D3733]">
            {notice.title}
          </h2>
        </div>
        <div className="p-6 pt-2">
          <div className="text-sm text-gray-500 pb-4 border-b mb-4">
            {notice.author} · {notice.createdAt}
          </div>
          <div className="whitespace-pre-wrap my-6">{notice.content}</div>
          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              삭제
            </button>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                취소
              </button>
              <button
                onClick={() => onEdit(notice)}
                className="px-4 py-2 bg-jippy-orange text-white rounded-lg hover:bg-[#D8692E]"
              >
                수정
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticeDetailModal;
