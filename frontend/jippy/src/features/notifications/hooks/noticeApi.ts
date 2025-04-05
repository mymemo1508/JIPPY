import {
  ApiResponse,
  CreateNoticeRequest,
  Notice,
  NoticeRequest,
  NoticeResponse,
  UpdateNoticeRequest,
} from "@/features/notifications/types/notifications";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const noticeApi = {
  getNotices: async (
    storeId: number,
    params: NoticeRequest
  ): Promise<ApiResponse<NoticeResponse>> => {
    const response = await fetch(`${BASE_URL}/api/notice/${storeId}/select`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(params),
    });
    if (!response.ok) throw new Error("공지사항 목록 조회에 실패했습니다.");
    return response.json();
  },

  createNotice: async (
    storeId: number,
    data: CreateNoticeRequest
  ): Promise<ApiResponse<Notice>> => {
    const response = await fetch(`${BASE_URL}/api/notice/${storeId}/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("공지사항 등록에 실패했습니다.");
    return response.json();
  },

  updateNotice: async (
    storeId: number,
    noticeId: number,
    data: UpdateNoticeRequest
  ): Promise<ApiResponse<Notice>> => {
    const response = await fetch(
      `${BASE_URL}/api/notice/${storeId}/update/${noticeId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) throw new Error("공지사항 수정에 실패했습니다.");
    return response.json();
  },

  deleteNotice: async (
    storeId: number,
    noticeId: number
  ): Promise<ApiResponse<void>> => {
    const response = await fetch(
      `${BASE_URL}/api/notice/${storeId}/delete/${noticeId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    if (!response.ok) throw new Error("공지사항 삭제에 실패했습니다.");
    return response.json();
  },
};

export default noticeApi;
