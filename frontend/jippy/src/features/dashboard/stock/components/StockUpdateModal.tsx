"use client";
import React, { useState, useEffect } from "react";
import { StockItem } from "@/redux/slices/stockDashSlice";

interface StockUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockItem: StockItem | null;
  unitIndex?: number;
  onSuccess: () => void;
}

const StockUpdateModal: React.FC<StockUpdateModalProps> = ({ isOpen, onClose, stockItem, unitIndex = 0, onSuccess }) => {
  const [stockCount, setStockCount] = useState<number>(0);

  useEffect(() => {
    if (stockItem && stockItem.stock[unitIndex]) {
      setStockCount(stockItem.stock[unitIndex].stockCount);
    }
  }, [stockItem, unitIndex]);

  if (!isOpen || !stockItem) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      inventory: [
        {
          stockName: stockItem.stockName,
          stock: [
            {
              stockCount,
              stockUnitSize: stockItem.stock[unitIndex].stockUnitSize,
              stockUnit: stockItem.stock[unitIndex].stockUnit,
              isDisposal: false,
            },
          ],
        },
      ],
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stock/1/update/${encodeURIComponent(stockItem.stockName)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("재고 수정 실패");
      alert("재고 수정 성공");
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("재고 수정 중 오류 발생");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-xl font-bold mb-4">재고 수정 - {stockItem.stockName}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1">수량</label>
            <input
              type="number"
              value={stockCount}
              onChange={(e) => setStockCount(Number(e.target.value))}
              className="w-full border px-2 py-1 rounded"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded border">
              취소
            </button>
            <button type="submit" className="px-4 py-2 rounded bg-orange-500 text-white">
              수정
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockUpdateModal;
