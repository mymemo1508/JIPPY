"use client";

import React, { useRef, useState } from "react";
import type { OCRResponse } from "@/features/shop/types/shops";
import "@/app/globals.css";
import { Input } from "@/features/common/components/ui/input/Input";
import { Button } from "@/features/common/components/ui/button";

interface OCRImageUploadProps {
  onSuccess: (data: OCRResponse) => void;
  isProcessing: boolean;
}

const OCRImageUpload = ({ onSuccess, isProcessing }: OCRImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isScanned, setIsScanned] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setIsScanned(false);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile) {
      fileInputRef.current?.click();
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      alert("파일 크기는 10MB를 초과할 수 없습니다.");
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }

    const formData = new FormData();
    formData.append("document", selectedFile);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ocr`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("이미지 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
      }

      const data: OCRResponse = await response.json();
      
      const hasEmptyValues = Object.values(data.data).some(value => value === "");
      
      if (hasEmptyValues) {
        setSelectedFile(null);
        setIsScanned(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        throw new Error("사업자등록증 스캔에 실패했습니다. 이미지를 다시 확인해주세요.");
      }

      onSuccess(data);
      setIsScanned(true);
      alert("사업자 등록 스캔에 성공했습니다!\n스캔된 정보를 확인하고, 실제 매장 주소를 입력해주세요🥸");
    } catch (error) {
      console.error("OCR Error:", error);
      alert(error instanceof Error ? error.message : "이미지 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const handleRetry = () => {
    setSelectedFile(null);
    setIsScanned(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-center space-x-2 w-full">
      <Input
        type="text"
        value={selectedFile ? selectedFile.name : ""}
        readOnly
        placeholder="사업자등록증을 스캔해주세요"
        className="h-[48px] text-base"
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        style={{ display: "none" }}
      />
      <Button
        variant="orangeSquare"
        onClick={isScanned ? handleRetry : selectedFile ? handleImageUpload : () => fileInputRef.current?.click()}
        disabled={isProcessing}
      >
        {isScanned ? "파일 재선택" : selectedFile ? "스캔하기" : "파일선택"}
      </Button>
      {isProcessing && (
        <div className="text-sm text-orange-500 mt-2">사업자등록증을 분석중입니다...</div>
      )}
    </div>
  );
};

export default OCRImageUpload;