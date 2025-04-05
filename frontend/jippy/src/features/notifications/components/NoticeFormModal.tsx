"use client";

import { useEffect, useState } from "react";
import { Notice } from "../types/notifications";
import noticeApi from "../hooks/noticeApi";

interface NoticeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: number;
  ownerName: string;
  initialData?: Notice;
  onSuccess: () => void;
}

const NoticeFormModal = ({
  isOpen,
  onClose,
  storeId,
  ownerName,
  initialData,
  onSuccess,
}: NoticeFormModalProps) => {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);

      if (initialData) {
        await noticeApi.updateNotice(storeId, initialData.noticeId, {
          title: title.trim(),
          content: content.trim(),
        });
      } else {
        await noticeApi.createNotice(storeId, {
          title: title.trim(),
          content: content.trim(),
          author: ownerName,
        });
      }

      await onSuccess();
      onClose();
      setTitle("");
      setContent("");
    } catch {
      alert("공지사항 처리에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setTitle(initialData?.title ?? "");
      setContent(initialData?.content ?? "");
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[600px] max-h-[90vh] overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6 text-[#3D3733]">
            {initialData ? "공지사항 수정" : "공지사항 등록"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                제목
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="제목을 입력하세요"
                maxLength={100}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                내용
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 h-[200px] resize-none"
                placeholder="내용을 입력하세요"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                disabled={isSubmitting}
              >
                취소
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-jippy-orange text-white rounded-lg hover:bg-[#D8692E]"
                disabled={isSubmitting}
              >
                {isSubmitting ? "처리 중..." : initialData ? "수정" : "등록"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NoticeFormModal;
