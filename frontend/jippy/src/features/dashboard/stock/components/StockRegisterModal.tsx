"use client";

import React, { useState } from "react";

interface StockRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const StockRegisterModal: React.FC<StockRegisterModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [stockName, setStockName] = useState("");
  const [stockCount, setStockCount] = useState<number | undefined>(undefined);
  const [stockUnitSize, setStockUnitSize] = useState("");
  const [stockUnit, setStockUnit] = useState("g");

  const unitOptions = ["kg", "g", "l", "ml", "개"];

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      inventory: [
        {
          stockName,
          stock: [
            {
              stockCount: stockCount || 0,
              stockUnitSize,
              stockUnit,
              isDisposal: false,
            },
          ],
        },
      ],
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stock/1/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("재고 등록 실패");
      alert("재고 등록 성공");
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("재고 등록 중 오류 발생");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-xl font-bold mb-4">재고 등록</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1">재고명</label>
            <input
              type="text"
              value={stockName}
              onChange={(e) => setStockName(e.target.value)}
              className="w-full border px-2 py-1 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">수량</label>
            <input
              type="number"
              placeholder="0"
              value={stockCount}
              onChange={(e) => setStockCount(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full border px-2 py-1 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">용량</label>
            <input
              type="text"
              placeholder="0"
              value={stockUnitSize}
              onChange={(e) => setStockUnitSize(e.target.value)}
              className="w-full border px-2 py-1 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">단위</label>
            <select
              value={stockUnit}
              onChange={(e) => setStockUnit(e.target.value)}
              className="w-full border px-2 py-1 rounded"
              required
            >
              {unitOptions.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded border">
              취소
            </button>
            <button type="submit" className="px-4 py-2 rounded bg-orange-500 text-white">
              등록
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockRegisterModal;