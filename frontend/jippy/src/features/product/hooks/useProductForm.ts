import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { createProduct } from "@/redux/slices/productSlice";
import axios from 'axios';  // axios import 추가

type ProductSize = 'S' | 'M' | 'L';
type ProductType = 'HOT' | 'ICE';

interface ProductFormData {
  name: string;
  price: number;
  productCategoryId: number;
  image: File | null;
  productSize: ProductSize;
  productType: ProductType;
  status: boolean;
}

interface ProductFormErrors {
  name?: string;
  price?: string;
  productCategoryId?: string;
  productSize?: string;
  productType?: string;
  submit?: string;
}

export const useProductForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentShop } = useSelector((state: RootState) => state.shop);
  const { loading: isLoading, error } = useSelector((state: RootState) => state.product);

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    price: 0,
    productCategoryId: 0,
    image: null,
    productSize: "M",
    productType: "HOT",
    status: true,
  });

  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [imagePreview, setImagePreview] = useState<string>("");


  const validateForm = () => {
    const newErrors: ProductFormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "상품명을 입력해주세요.";
    }

    if (formData.price <= 0) {
      newErrors.price = "올바른 가격을 입력해주세요.";
    }

    if (!formData.productCategoryId && selectedCategory !== "전체") {
      newErrors.productCategoryId = "카테고리를 선택해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? Number(value) : value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategorySelect = async (categoryName: string, categoryId: number) => {
    try {
      // 먼저 현재 매장 ID 확인
      if (!currentShop?.id) {
        throw new Error("매장 정보가 없습니다.");
      }

      // 카테고리 유효성 검증
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await axios.get(`${API_URL}/api/category/${currentShop.id}/select`);
      
      console.log('=== 카테고리 목록 ===');
      console.log(response.data);
      
      // 선택된 카테고리가 유효한지 확인
      const isValidCategory = response.data.data.some(
        (category: { id: number }) => category.id === categoryId
      );
      
      if (!isValidCategory) {
        setErrors(prev => ({
          ...prev,
          productCategoryId: "유효하지 않은 카테고리입니다."
        }));
        return;
      }

      console.log('=== 카테고리 선택 ===');
      console.log('categoryName:', categoryName);
      console.log('categoryId:', categoryId);
      
      setSelectedCategory(categoryName);
      setFormData((prev) => ({
        ...prev,
        productCategoryId: categoryId,
      }));
    } catch (error) {
      console.error('카테고리 검증 실패:', error);
      setErrors(prev => ({
        ...prev,
        productCategoryId: "카테고리 검증에 실패했습니다."
      }));
    }
  };


  const handleSizeChange = (size: ProductSize) => {
    setFormData((prev) => ({ ...prev, productSize: size }));
  };

  const handleTypeChange = (type: ProductType) => {
    setFormData((prev) => ({ ...prev, productType: type }));
  };

// useProductForm.ts - handleSubmit 함수 수정
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) return;

  if (!currentShop?.id) {
    setErrors({ ...errors, submit: "매장 정보를 찾을 수 없습니다." });
    return;
  }

  // 카테고리 ID 유효성 검사 추가
  if (!formData.productCategoryId || formData.productCategoryId <= 0) {
    setErrors({ ...errors, productCategoryId: "카테고리를 선택해주세요." });
    return;
  }

  // 백엔드 엔티티 구조에 맞게 데이터 구성
  const jsonData = {
    name: formData.name,
    price: Number(formData.price),
    productCategory: {
      id: formData.productCategoryId
    },
    store: {
      id: currentShop.id
    },
    status: formData.status,
    image: "temp_image",
    productType: formData.productType,
    productSize: formData.productSize
  };

  // FormData 객체 생성
  const form = new FormData();
  form.append('data', JSON.stringify(jsonData));

  console.log('=== 전송 데이터 ===');
  console.log('요청 데이터:', jsonData);

  try {
    await dispatch(
      createProduct({
        productData: form,
        storeId: currentShop.id,
      })
    ).unwrap();

    // 성공 시 폼 초기화
    setFormData({
      name: "",
      price: 0,
      productCategoryId: 0,
      image: null,
      productSize: "M",
      productType: "HOT",
      status: true,
    });
    setImagePreview("");
    setSelectedCategory("전체");
    
  } catch (error) {
    console.error("상품 등록 실패:", error);
    setErrors({ 
      ...errors, 
      submit: typeof error === 'string' ? error : '상품 등록에 실패했습니다.' 
    });
  }
};

  return {
    formData,
    errors,
    isLoading,
    error,
    selectedCategory,
    imagePreview,
    handleChange,
    handleSubmit,
    handleCategorySelect,
    handleImageUpload,
    handleSizeChange,
    handleTypeChange,
  };
};