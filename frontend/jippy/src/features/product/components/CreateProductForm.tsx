// "use client";

// import React from "react";
// import { useProductForm } from "@/features/product/hooks/useProductForm";
// import "@/app/globals.css";
// import { FormField } from "@/features/common/components/ui/form/FormFields";
// import { Alert, AlertDescription } from "@/features/common/components/ui/Alert";
// import { Button } from "@/features/common/components/ui/button";
// import CreateCategory from "@/features/order/components/Category";
// import ProductImageUpload from "@/features/product/components/ProductImageUpload";

// // 상단에 타입 정의
// type ProductSize = "S" | "M" | "L";
// type ProductType = "HOT" | "ICE";

// // 상수 배열 정의
// const PRODUCT_SIZES: ProductSize[] = ["S", "M", "L"];
// const PRODUCT_TYPES: ProductType[] = ["HOT", "ICE"];

// const CreateProductForm: React.FC = () => {
//   const {
//     formData,
//     errors,
//     isLoading,
//     error,
//     selectedCategory,
//     imagePreview,
//     handleChange,
//     handleSubmit,
//     handleCategorySelect,
//     handleImageUpload,
//     handleSizeChange,
//     handleTypeChange,
//   } = useProductForm();

//   return (
//     <div className="flex flex-col items-center justify-center">
//       <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
//         {/* 카테고리 선택 */}
//         <div className="mb-4">
//           <CreateCategory
//             selectedCategory={selectedCategory}
//             onCategorySelect={handleCategorySelect}
//           />
//         </div>

//         {/* 상품 기본 정보 */}
//         <FormField
//           label="상품명"
//           name="name"
//           value={formData.name}
//           onChange={handleChange}
//           error={errors.name}
//           required
//         />

//         <FormField
//           label="상품 가격"
//           name="price"
//           type="number"
//           value={formData.price}
//           onChange={handleChange}
//           error={errors.price}
//           required
//         />

//         {/* 상품 이미지 업로드 */}
//         <FormField
//           label="상품 이미지"
//           name="image"
//           customInput={
//             <ProductImageUpload
//               imagePreview={imagePreview}
//               onImageUpload={handleImageUpload}
//             />
//           }
//         />

//       {/* 상품 사이즈 선택 */}
//       <div className="grid grid-cols-3 gap-2">
//         {PRODUCT_SIZES.map((size) => (
//           <Button
//             key={size}
//             variant={formData.productSize === size ? "orange" : "default"}
//             onClick={() => handleSizeChange(size)}
//             className="w-full"
//           >
//             {size}
//           </Button>
//         ))}
//       </div>

//       {/* 상품 온도 선택 */}
//       <div className="grid grid-cols-2 gap-2">
//         {PRODUCT_TYPES.map((type) => (
//           <Button
//             key={type}
//             variant={formData.productType === type ? "orange" : "default"}
//             onClick={() => handleTypeChange(type)}
//             className="w-full"
//           >
//             {type}
//           </Button>
//         ))}
//       </div>

//         {error && (
//           <Alert variant="destructive">
//             <AlertDescription>{error}</AlertDescription>
//           </Alert>
//         )}

//         <Button
//           variant="orange"
//           disabled={isLoading}
//           className="w-full mt-4"
//         >
//           {isLoading ? "등록 중..." : "상품 등록"}
//         </Button>
//       </form>
//     </div>
//   );
// };

// export default CreateProductForm;
