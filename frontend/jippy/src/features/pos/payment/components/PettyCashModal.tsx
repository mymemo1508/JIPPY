import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/features/common/components/ui/dialog/dialog";

interface PettyCashModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: number;
}

interface CashData {
  id: number;
  store_id: number;
  fifty_thousand_won: number;
  ten_thousand_won: number;
  five_thousand_won: number;
  one_thousand_won: number;
  five_hundred_won: number;
  one_hundred_won: number;
  fifty_won: number;
  ten_won: number;
}

interface PaymentHistoryItem {
  createdAt: string;
  paymentStatus: string;
  paymentType: string;
  totalCost: number;
  uuid: string;
}

const denominationMap = {
  fifty_thousand_won: { value: 50000, label: "50,000원" },
  ten_thousand_won: { value: 10000, label: "10,000원" },
  five_thousand_won: { value: 5000, label: "5,000원" },
  one_thousand_won: { value: 1000, label: "1,000원" },
  five_hundred_won: { value: 500, label: "500원" },
  one_hundred_won: { value: 100, label: "100원" },
  fifty_won: { value: 50, label: "50원" },
  ten_won: { value: 10, label: "10원" },
};

const PettyCashModal = ({
  isOpen,
  onClose,
  storeId,
}: PettyCashModalProps) => {
  const [activeTab, setActiveTab] = useState<"cash" | "qr">("cash");
  const [cashData, setCashData] = useState<CashData | null>(null);
  const [modifiedCash, setModifiedCash] = useState<CashData | null>(null);
  const [qrPayments, setQrPayments] = useState<PaymentHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [requestStartTime, setRequestStartTime] = useState<number | null>(null);
  const [initialCash, setInitialCash] = useState<
    Omit<CashData, "id" | "store_id">
  >({
    fifty_thousand_won: 0,
    ten_thousand_won: 0,
    five_thousand_won: 0,
    one_thousand_won: 0,
    five_hundred_won: 0,
    one_hundred_won: 0,
    fifty_won: 0,
    ten_won: 0,
  });

  const fetchQrPayments = async () => {
    setIsLoading(true);
    setError(null);
    setRequestStartTime(Date.now());

    try {
      const today = new Date();
      const startDate = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endDate = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      const url =
        `${process.env.NEXT_PUBLIC_API_URL}/api/payment-history/list?` +
        new URLSearchParams({
          storeId: storeId.toString(),
          startDate,
          endDate,
          status: "SUCCESS",
          type: "QR",
        });

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`QR 결제 내역 요청 실패: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.message || "QR 결제 내역을 불러오는데 실패했습니다"
        );
      }

      setQrPayments(result.data);
      setError(null);
    } catch (error) {
      console.error("QR payments fetch error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다"
      );
    } finally {
      setIsLoading(false);
      setRequestStartTime(null);
    }
  };

  const fetchCashData = async () => {
    setIsLoading(true);
    setError(null);
    setRequestStartTime(Date.now());

    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/cash/${storeId}/select`;

      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 404 || response.status === 500) {
          setCashData(null);
          setModifiedCash(null);
          return;
        }
        throw new Error(`시재 정보 요청 실패: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.message || "시재 정보를 불러오는데 실패했습니다"
        );
      }

      setCashData(result.data);
      setModifiedCash(result.data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다"
      );
    } finally {
      setIsLoading(false);
      setRequestStartTime(null);
    }
  };

  const createInitialCash = async () => {
    setIsLoading(true);
    setError(null);
    setRequestStartTime(Date.now());

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cash/${storeId}/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(initialCash),
        }
      );

      if (!response.ok) {
        throw new Error("시재 추가에 실패했습니다");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error("시재 추가에 실패했습니다");
      }

      await fetchCashData();
    } catch (error) {
      setError("시재 추가에 실패했습니다");
      console.error("Create cash error:", error);
    } finally {
      setIsLoading(false);
      setRequestStartTime(null);
    }
  };

  const updateCashData = async () => {
    if (!modifiedCash) return;

    setIsLoading(true);
    setError(null);
    setRequestStartTime(Date.now());

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cash/${storeId}/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(modifiedCash),
        }
      );

      if (!response.ok) {
        throw new Error("시재 수정에 실패했습니다");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error("시재 수정에 실패했습니다");
      }

      setCashData(modifiedCash);
    } catch (error) {
      setError("시재 수정에 실패했습니다");
      console.error("Update cash error:", error);
    } finally {
      setIsLoading(false);
      setRequestStartTime(null);
    }
  };

  const handleModifiedCashChange = (
    key: keyof Omit<CashData, "id" | "store_id">,
    count: number
  ) => {
    if (!modifiedCash) return;

    setModifiedCash({
      ...modifiedCash,
      [key]: count,
    });
  };

  const calculateTotal = (data: Omit<CashData, "id" | "store_id">) => {
    return Object.entries(denominationMap).reduce((sum, [key, { value }]) => {
      return sum + value * data[key as keyof typeof data];
    }, 0);
  };

  const calculateQrTotal = () => {
    return qrPayments.reduce((sum, payment) => sum + payment.totalCost, 0);
  };

  const hasChanges = () => {
    if (!cashData || !modifiedCash) return false;
    return Object.keys(denominationMap).some(
      (key) =>
        cashData[key as keyof CashData] !== modifiedCash[key as keyof CashData]
    );
  };

  useEffect(() => {

    if (isOpen) {
      if (activeTab === "cash") {
        fetchCashData();
      } else {
        fetchQrPayments();
      }
    }
  }, [isOpen, activeTab, storeId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>시재 정산</DialogTitle>
            <span className="text-sm text-gray-500 pt-2">
              {new Date().toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
              })} 기준
            </span>
        </DialogHeader>

        <div className="mb-4">
          <div className="flex space-x-2 border-b">
            <button
              className={`px-4 py-2 ${
                activeTab === "cash"
                  ? "border-b-2 border-orange-500 text-orange-500"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("cash")}
            >
              현금 정산
            </button>
            <button
              className={`px-4 py-2 ${
                activeTab === "qr"
                  ? "border-b-2 border-orange-500 text-orange-500"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("qr")}
            >
              QR 정산
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500" />
          </div>
        ) : error ? (
          <div className="text-red-500 p-4 text-center bg-red-50 rounded-lg">
            <p className="text-sm">{error}</p>
          </div>
        ) : activeTab === "qr" ? (
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-center">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border-b border-r">주문 건수</th>
                    <th className="py-2 px-4 border-b">총 매출액</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-3 px-4  border-r">{qrPayments.length.toLocaleString()} 건</td>
                    <td className="py-3 px-4">
                      {calculateQrTotal().toLocaleString()}원
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
        ) : !cashData ? (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-4">초기 시재 입력</h3>
            <table className="w-full border-collapse text-center">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2">권종</th>
                  <th className="border px-4 py-2">수량</th>
                  <th className="border px-4 py-2">금액</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(denominationMap).map(
                  ([key, { label, value }]) => (
                    <tr key={key}>
                      <td className="border px-4 py-2">{label}</td>
                      <td className="border px-4 py-2 text-center">
                        <input
                          type="number"
                          min="0"
                          className="w-16 text-center border rounded-md"
                          value={initialCash[key as keyof typeof initialCash]}
                          onChange={(e) =>
                            setInitialCash((prev) => ({
                              ...prev,
                              [key]: parseInt(e.target.value) || 0,
                            }))
                          }
                        />
                      </td>
                      <td className="border px-4 py-2 text-right">
                        {(
                          initialCash[key as keyof typeof initialCash] * value
                        ).toLocaleString()}원
                      </td>
                    </tr>
                  )
                )}
                <tr className="bg-gray-50 font-semibold">
                  <td className="border px-4 py-3" colSpan={2}>총계</td>
                  <td className="border px-4 py-3 text-right">
                    {calculateTotal(initialCash).toLocaleString()}원
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="mt-6 flex justify-end">
              <button
                onClick={createInitialCash}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200"
              >
                시재 등록
              </button>
            </div>
          </div>
        ) : (
          <div>
            <table className="w-full border-collapse text-center rounded-md">
              <thead>
                <tr className="bg-gray-100 ">
                  <th className="border px-4 py-2">화폐 단위</th>
                  <th className="border px-4 py-2">수량</th>
                  <th className="border px-4 py-2">금액</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(denominationMap).map(
                  ([key, { label, value }]) => (
                    <tr key={key}>
                      <td className="border px-4 py-2">{label}</td>
                      <td className="border px-4 py-2 text-center">
                        <input
                          type="number"
                          min="0"
                          className="w-16 text-center rounded-md"
                          value={modifiedCash?.[key as keyof CashData] ?? 0}
                          onChange={(e) =>
                            handleModifiedCashChange(
                              key as keyof Omit<CashData, "id" | "store_id">,
                              parseInt(e.target.value) || 0
                            )
                          }
                        />
                      </td>
                      <td className="border px-4 py-2 text-right">
                        {(
                          (modifiedCash?.[key as keyof CashData] ?? 0) * value
                        ).toLocaleString()}원
                      </td>
                    </tr>
                  )
                )}
                <tr className="bg-gray-50 font-semibold">
                  <td className="border px-4 py-3" colSpan={2}>총계</td>
                  <td className="border px-4 py-3 text-right">
                    {modifiedCash && calculateTotal(modifiedCash).toLocaleString()}원
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="mt-6 flex justify-end">
              <button
                onClick={updateCashData}
                disabled={!hasChanges()}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                  hasChanges()
                    ? "bg-orange-500 text-white hover:bg-orange-600"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                시재 수정
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PettyCashModal;
