"use client";

import React from "react";
import { useShopForm } from "@/features/shop/hooks/useShopForm";
import "@/app/globals.css";
import { FormField } from "@/features/common/components/ui/form/FormFields";
import { Alert, AlertDescription } from "@/features/common/components/ui/Alert";
import { Button } from "@/features/common/components/ui/button";
import OCRImageUpload from "@/features/shop/components/OCRImageUpload";

const CreateShopForm = () => {
  const {
    formData,
    errors,
    isLoading,
    error,
    isProcessingImage,
    handleChange,
    handleSubmit,
    handleOCRSuccess,
  } = useShopForm();

  return (
    <div className="flex flex-col items-center justify-center">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
      <FormField
        label="사업자등록증 스캔"
        name="businessRegistration"
        required
        customInput={
          <OCRImageUpload
            onSuccess={handleOCRSuccess}
            isProcessing={isProcessingImage}
          />
        }
      />

        <FormField
          label="매장명(상호)"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <FormField
          label="대표자명"
          name="representativeName"
          value={formData.representativeName}
          onChange={handleChange}
          required
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
        />

        <FormField
          label="사업자 등록번호"
          name="businessRegistrationNumber"
          value={formData.businessRegistrationNumber}
          onChange={handleChange}
          placeholder="000-00-00000"
          maxLength={12}
          required
        />

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          variant="orange"
          disabled={isLoading || isProcessingImage}
          className="w-full mt-4"
        >
          {isLoading ? "등록 중..." : "매장 등록"}
        </Button>
      </form>
    </div>
  );
};

export default CreateShopForm;