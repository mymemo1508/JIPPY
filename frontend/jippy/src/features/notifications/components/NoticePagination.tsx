"use client";

interface NoticePaginationProps {
  currentPage: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
  onPageChange: (page: number) => void;
}

const NoticePagination = ({
  currentPage,
  totalPages,
  isFirst,
  isLast,
  onPageChange,
}: NoticePaginationProps) => {
  return (
    <div className="flex justify-center gap-4 mt-auto pt-4">
      <button
        className="px-4 py-2 border border-jippy-orange text-jippy-orange rounded disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-jippy-orange hover:bg-jippy-orange hover:text-white transition-colors"
        onClick={() => onPageChange(Math.max(0, currentPage - 1))}
        disabled={isFirst}
      >
        이전
      </button>
      <p className="py-2">
        <span className="text-jippy-orange font-medium">{currentPage + 1}</span>{" "}
        / {totalPages}
      </p>
      <button
        className="px-4 py-2 border border-jippy-orange text-jippy-orange rounded disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-jippy-orange hover:bg-jippy-orange hover:text-white transition-colors"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLast}
      >
        다음
      </button>
    </div>
  );
};

export default NoticePagination;
