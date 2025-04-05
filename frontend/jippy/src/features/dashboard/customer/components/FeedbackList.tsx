import React, { useState } from 'react';
import useFeedbacks from '@/features/dashboard/customer/hooks/useFeedbacks';
import { Feedback } from '@/features/dashboard/customer/types/customer';
import { Trash2 } from "lucide-react";

interface FeedbackListProps {
  storeId: number;
  selectedCategory: string | null;
}

const FeedbackList: React.FC<FeedbackListProps> = ({ storeId, selectedCategory }) => {
  const { feedbacks, loading, error, deleteFeedback } = useFeedbacks(storeId, selectedCategory);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // 페이지네이션 계산
  const totalItems = feedbacks.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentItems = feedbacks.slice(startIdx, startIdx + itemsPerPage);

  const handleDelete = (feedbackId: number) => {
    deleteFeedback(feedbackId);
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="py-4">
      {loading && <p className="text-gray-500">로딩중...</p>}
      {error && <p className="text-red-500">오류: {error}</p>}
      {!loading && totalItems === 0 && <p className="text-gray-700">피드백이 없습니다.</p>}

      {/* 피드백 카드 리스트 */}
      <div className="space-y-4">
        {currentItems.map((fb: Feedback) => (
          <div
            key={fb.id}
            className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-white rounded-lg shadow border border-gray-200"
          >
            <div className="flex-1">
              <p className="text-sm text-gray-500">{fb.createdAt}</p>
              <p className="mt-1 font-medium text-lg text-gray-800">{fb.category}</p>
              <p className="mt-2 text-gray-700">{fb.content}</p>
            </div>
            <button
              onClick={() => handleDelete(fb.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 size={25} />
            </button>
          </div>
        ))}
      </div>

      {/* 페이지네이션 컨트롤 */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row sm:justify-between items-center">
          <div className="mb-2 sm:mb-0">
            <label htmlFor="itemsPerPage" className="mr-2 text-gray-700">
              한 페이지에 보여줄 항목:
            </label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="border border-gray-300 rounded p-1 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value={5}>5개</option>
              <option value={10}>10개</option>
            </select>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
            >
              이전
            </button>
            <span className="text-gray-700">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
            >
              다음
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackList;
