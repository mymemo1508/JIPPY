"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { PaymentHistoryItem, PaymentHistoryDetail } from "@/features/pos/payment/types/history";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface PaymentApiResponse extends PaymentHistoryItem {
  buyProduct?: Array<{
    productId: number;
    productName: string;
    productCategoryId: number;
    productQuantity: number;
    price: number;
  }>;
}

interface HistoryListProps {
  onSelectPayment: (payment: PaymentHistoryDetail) => void;
  onPaymentStatusChange?: (payment: PaymentHistoryDetail) => void;
  filter?: "all" | "success" | "cancel";
}

interface FilterTabProps {
  currentFilter: "all" | "success" | "cancel";
  onFilterChange: (filter: "all" | "success" | "cancel") => void;
}

const FilterTabs = ({ currentFilter, onFilterChange }: FilterTabProps) => (
  <div className="flex space-x-2 mb-4">
    <button
      onClick={() => onFilterChange("all")}
      className={`px-4 py-2 transition-colors ${
        currentFilter === "all"
          ? "border-b-2 border-orange-500 text-orange-600 font-medium"
          : "text-gray-500 hover:text-gray-700"
      }`}
    >
      전체
    </button>
    <button
      onClick={() => onFilterChange("success")}
      className={`px-4 py-2 transition-colors ${
        currentFilter === "success"
          ? "border-b-2 border-orange-500 text-orange-600 font-medium"
          : "text-gray-500 hover:text-gray-700"
      }`}
    >
      결제완료
    </button>
    <button
      onClick={() => onFilterChange("cancel")}
      className={`px-4 py-2 transition-colors ${
        currentFilter === "cancel"
          ? "border-b-2 border-orange-500 text-orange-600 font-medium"
          : "text-gray-500 hover:text-gray-700"
      }`}
    >
      결제취소
    </button>
  </div>
);

const fetchFromAPI = async <T,>(url: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error("API 요청에 실패했습니다");
  }

  const result: ApiResponse<T> = await response.json();
  return result.data;
};

const PaymentHistoryList = ({
  onSelectPayment,
  onPaymentStatusChange,
  filter = "all",
}: HistoryListProps) => {
  const [currentFilter, setCurrentFilter] = useState<"all" | "success" | "cancel">(filter);
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPaymentDetail, setSelectedPaymentDetail] = useState<PaymentHistoryDetail | null>(null);
  const itemsPerPage = 10;

  const storeId = 1;

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!process.env.NEXT_PUBLIC_API_URL) {
        throw new Error("API URL이 설정되지 않았습니다.");
      }

      const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/payment-history`;
      const params = new URLSearchParams({
        storeId: storeId.toString(),
      });

      let url;
      switch (currentFilter) {
        case "success":
          url = `${baseUrl}/list/success?${params}`;
          break;
        case "cancel":
          url = `${baseUrl}/list/cancel?${params}`;
          break;
        default:
          url = `${baseUrl}/list?${params}`;
      }

      const data = await fetchFromAPI<PaymentApiResponse[]>(url);

      const mappedData = data.map((payment) => ({
        ...payment,
        paymentStatus: payment.paymentStatus === "PURCHASE" || payment.paymentStatus === "구매" ? "완료" : 
                      payment.paymentStatus === "CANCEL" || payment.paymentStatus === "취소" ? "취소" : 
                      payment.paymentStatus
      }));

      setPayments(mappedData || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "결제 내역을 불러오는 중 알 수 없는 오류가 발생했습니다.";

      setError(errorMessage);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [currentFilter, storeId]);

  const fetchPaymentDetail = useCallback(
    async (uuid: string): Promise<PaymentHistoryDetail | null> => {
      try {
        if (!process.env.NEXT_PUBLIC_API_URL) {
          throw new Error("API URL이 설정되지 않았습니다.");
        }

        const data = await fetchFromAPI<PaymentApiResponse>(
          `${process.env.NEXT_PUBLIC_API_URL}/api/payment-history/detail`,
          {
            method: "POST",
            body: JSON.stringify({
              storeId: storeId,
              paymentUUID: uuid,
            }),
          }
        );

        const transformedData: PaymentHistoryDetail = {
          ...data,
          paymentStatus: data.paymentStatus === "PURCHASE" ? "완료" : 
                        data.paymentStatus === "CANCEL" ? "취소" : 
                        data.paymentStatus,
          buyProduct: data.buyProduct || []
        };

        return transformedData;
      } catch (err) {
        console.error("결제 상세 정보 조회 실패:", err);
        return null;
      }
    },
    [storeId]
  );

  const handleFilterChange = (newFilter: "all" | "success" | "cancel") => {
    setCurrentFilter(newFilter);
    setCurrentPage(1);
    setSelectedPaymentDetail(null);
  };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handlePaymentStatusUpdate = useCallback((updatedPayment: PaymentHistoryDetail) => {
    setSelectedPaymentDetail(updatedPayment);
    onPaymentStatusChange?.(updatedPayment);
    
    if (currentFilter === "success" && updatedPayment.paymentStatus === "취소") {
      setPayments(prevPayments => 
        prevPayments.filter(payment => payment.uuid !== updatedPayment.uuid)
      );
    } else if (currentFilter === "cancel" && updatedPayment.paymentStatus === "완료") {
      setPayments(prevPayments => 
        prevPayments.filter(payment => payment.uuid !== updatedPayment.uuid)
      );
    } else {
      setPayments(prevPayments => 
        prevPayments.map(payment => 
          payment.uuid === updatedPayment.uuid 
            ? { ...payment, paymentStatus: updatedPayment.paymentStatus }
            : payment
        )
      );
    }
  }, [currentFilter, onPaymentStatusChange]);
  
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments, currentFilter]);

  const handlePaymentSelect = async (payment: PaymentHistoryItem) => {
    try {
      const result = await fetchPaymentDetail(payment.uuid);
      if (result) {
        setSelectedPaymentDetail(result);
        onSelectPayment(result);
      }
    } catch (error) {
      console.error("결제 상세 정보 조회 실패:", error);
    }
  };

  const filteredAndPaginatedPayments = useMemo(() => {
    let filtered = [...payments];

    filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (startDate || endDate) {
      filtered = filtered.filter((payment) => {
        const paymentDate = new Date(payment.createdAt);
        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date();
        end.setHours(23, 59, 59, 999);

        return paymentDate >= start && paymentDate <= end;
      });
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [payments, startDate, endDate, currentPage]);

  const totalPages = useMemo(() => {
    const filteredCount = payments.filter((payment) => {
      if (!startDate && !endDate) return true;

      const paymentDate = new Date(payment.createdAt);
      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate) : new Date();
      end.setHours(23, 59, 59, 999);

      return paymentDate >= start && paymentDate <= end;
    }).length;

    return Math.ceil(filteredCount / itemsPerPage);
  }, [payments, startDate, endDate]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="p-4">
        <FilterTabs currentFilter={currentFilter} onFilterChange={handleFilterChange} />
        <div className="flex flex-col sm:flex-row gap-4 items-center border-b pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <label htmlFor="startDate" className="text-gray-600 whitespace-nowrap">
              시작일:
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded px-2 py-1 w-full sm:w-auto"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <label htmlFor="endDate" className="text-gray-600 whitespace-nowrap">
              종료일:
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded px-2 py-1 w-full sm:w-auto"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center" style={{ height: '400px' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">결제 내역을 불러오는 중...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center" style={{ height: '400px' }}>
          <div className="text-red-500 text-center">{error}</div>
        </div>
      ) : filteredAndPaginatedPayments.length === 0 ? (
        <div className="flex items-center justify-center" style={{ height: '400px' }}>
          <div className="text-center text-gray-500">
            결제 내역이 없습니다.
          </div>
        </div>
      ) : (
        <div className="overflow-hidden p-4" style={{ minHeight: '400px' }}>
          <div className="min-w-full overflow-x-auto">
            <table className="w-full text-center">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 whitespace-nowrap">결제일시</th>
                  <th className="px-4 py-2 whitespace-nowrap">결제금액</th>
                  <th className="px-4 py-2 whitespace-nowrap">결제수단</th>
                  <th className="px-4 py-2 whitespace-nowrap">상태</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndPaginatedPayments.map((payment) => (
                  <tr
                    key={payment.uuid}
                    onClick={() => handlePaymentSelect(payment)}
                    className={`hover:bg-orange-50 cursor-pointer border-b transition-colors
                      ${selectedPaymentDetail?.uuid === payment.uuid ? "bg-orange-100" : ""}`}
                  >
                    <td className="px-4 py-2 whitespace-nowrap">
                      {new Date(payment.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-orange-600 font-medium whitespace-nowrap">
                      {payment.totalCost.toLocaleString()}원
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {payment.paymentType}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-sm transition-colors
                        ${
                          payment.paymentStatus === "완료"
                            ? "bg-green-100 text-green-800"
                            : payment.paymentStatus === "취소"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {payment.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center items-center gap-1 sm:gap-2 p-4 flex-wrap mt-4">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="px-2 sm:px-3 py-1 rounded border disabled:opacity-50 text-sm sm:text-base transition-opacity"
            >
              {"<<"}
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-2 sm:px-3 py-1 rounded border disabled:opacity-50 text-sm sm:text-base"
            >
              {"<"}
            </button>

            <span className="mx-2 sm:mx-4 text-sm sm:text-base">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-2 sm:px-3 py-1 rounded border disabled:opacity-50 text-sm sm:text-base"
            >
              {">"}
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="px-2 sm:px-3 py-1 rounded border disabled:opacity-50 text-sm sm:text-base"
            >
              {">>"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistoryList;