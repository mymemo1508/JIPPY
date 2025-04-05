// features/product/components/ProductImageUpload.tsx
import React from "react";
import Image from "next/image";

interface ProductImageUploadProps {
  imagePreview: string;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProductImageUpload = ({ imagePreview, onImageUpload }: ProductImageUploadProps) => {
  return (
    <div className="space-y-2">
      <input
        type="file"
        accept="image/*"
        onChange={onImageUpload}
        className="w-full"
      />
      {imagePreview && (
        <div className="mt-2">
          <Image
            src={imagePreview}
            alt="상품 이미지 미리보기"
            width={200}
            height={200}
            className="rounded-md"
          />
        </div>
      )}
    </div>
  );
};

export default ProductImageUpload;