"use client";

import React, { useState } from "react";
import { FormField } from "@/features/common/components/ui/form/FormFields";
import { Shop } from "../types/shops";
import { cn } from "@/lib/utils";

interface UpdateShopFormProps {
  shop: Shop;
  onClose: () => void;
  onSuccess?: (data: Shop) => void;
  accessToken: string | null;
}

export const UpdateShopForm: React.FC<UpdateShopFormProps> = ({ 
  shop, 
  onClose, 
  onSuccess, 
  accessToken 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: shop.name,
    address: shop.address,
    openingDate: new Date(shop.openingDate).toISOString().split("T")[0],
    totalCash: shop.totalCash.toString()
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 에러 초기화
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!accessToken) {
        throw new Error("인증 토큰이 없습니다.");
      }

      const { name, address, openingDate } = formData;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/store/update/${shop.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          name,
          address,
          openingDate,
          totalCash: parseInt(formData.totalCash)
        }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
      
      if (result.success && result.data) {
        const updatedShop: Shop = {
          ...shop,
          ...result.data
        };
        onSuccess?.(updatedShop);
      } else {
        throw new Error("Update failed");
      }
    } catch (error) {
      console.error("Update error:", error);
      setErrors({ submit: "매장 정보 업데이트 중 오류가 발생했습니다." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.submit && (
        <div className={cn(
          "bg-red-100 border border-red-400 text-red-700",
          "px-4 py-3 rounded"
        )}>
          {errors.submit}
        </div>
      )}

      <FormField
        label="매장명"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        required
        maxLength={50}
      />

      <FormField
        label="주소"
        name="address"
        value={formData.address}
        onChange={handleChange}
        error={errors.address}
        required
      />

      <FormField
        label="개업일"
        name="openingDate"
        type="date"
        value={formData.openingDate}
        onChange={handleChange}
        error={errors.openingDate}
        required
      />

      <FormField
        label="보유 현금"
        name="totalCash"
        type="number"
        value={formData.totalCash}
        onChange={handleChange}
        error={errors.totalCash}
        required
      />

      <div className="flex justify-end gap-2 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          disabled={isSubmitting}
        >
          취소
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={isSubmitting}
        >
          {isSubmitting ? "저장 중..." : "저장"}
        </button>
      </div>
    </form>
  );
};