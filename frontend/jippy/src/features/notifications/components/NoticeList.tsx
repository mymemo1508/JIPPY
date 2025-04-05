"use client";

import useNoticeList from "../hooks/useNotice";
import NoticePagination from "@/features/notifications/components/NoticePagination";
import NoticeFormModal from "./NoticeFormModal";
import { useState } from "react";
import { Notice } from "../types/notifications";
import noticeApi from "../hooks/noticeApi";
import NoticeDetailModal from "./NoticeDetailModal";
import { Card } from "@/features/common/components/ui/card/Card";
import { Bell } from "lucide-react";

interface NoticeListProps {
  storeId: number;
  ownerName: string;
}

const NoticeList = ({ storeId, ownerName }: NoticeListProps) => {
  const { notices, isLoading, handlePageChange, refreshNotices } =
    useNoticeList({
      storeId,
      ownerName,
      pageSize: 5,
    });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  const handleNoticeClick = (notice: Notice) => {
    setSelectedNotice(notice);
  };

  const handleDelete = async (noticeId: number) => {
    try {
      await noticeApi.deleteNotice(storeId, noticeId);
      setSelectedNotice(null);
      refreshNotices();
    } catch {
      alert("공지사항 삭제에 실패했습니다.");
    }
  };

  if (isLoading) return null;

  if (!notices?.content || notices.content.length === 0) {
    return (
      <Card className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[#3D3733]">공지사항</h2>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-[#F27B39] text-white rounded-lg hover:bg-[#F27B39]/90 transition-colors"
            >
              + 공지사항 등록
            </button>
          </div>
          <div className="py-12 flex flex-col items-center justify-center text-gray-500">
            <Bell className="h-12 w-12 mb-4 text-gray-300" />
            <p className="text-center mb-1">등록된 공지사항이 없습니다.</p>
            <p className="text-sm text-center text-gray-400">
              새로운 공지사항을 등록해주세요.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-[#3D3733]">공지사항</h2>
            <span className="ml-2 px-2 py-1 bg-[#F27B39]/10 text-jippy-orange rounded-full text-[15px]">
              총 {notices.totalElements}개
            </span>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-jippy-orange text-white rounded-lg hover:bg-[#D8692E] transition-colors"
          >
            + 공지사항 등록
          </button>
        </div>

        <div className="space-y-2 mb-4">
          {notices.content.map((notice) => (
            <div
              key={notice.noticeId}
              onClick={() => handleNoticeClick(notice)}
              className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-100"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium line-clamp-1">{notice.title}</span>
                <span className="text-sm text-gray-500">
                  {notice.createdAt.split(" ")[0]}
                </span>
              </div>
            </div>
          ))}
        </div>

        {notices && (
          <div className="flex justify-center">
            <NoticePagination
              currentPage={notices.page}
              totalPages={notices.totalPages}
              isFirst={notices.isFirst}
              isLast={notices.isLast}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      <NoticeFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        storeId={storeId}
        ownerName={ownerName}
        onSuccess={() => {
          refreshNotices();
          setIsCreateModalOpen(false);
        }}
      />

      {selectedNotice && (
        <NoticeDetailModal
          notice={selectedNotice}
          isOpen={!!selectedNotice}
          onClose={() => setSelectedNotice(null)}
          onEdit={(notice) => {
            setEditingNotice(notice);
            setSelectedNotice(null);
          }}
          onDelete={handleDelete}
        />
      )}

      {editingNotice && (
        <NoticeFormModal
          isOpen={!!editingNotice}
          onClose={() => setEditingNotice(null)}
          storeId={storeId}
          ownerName={ownerName}
          initialData={editingNotice}
          onSuccess={() => {
            refreshNotices();
            setEditingNotice(null);
          }}
        />
      )}
    </Card>
  );
};

export default NoticeList;
