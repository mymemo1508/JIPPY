"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import styles from "@/app/page.module.css";
import Button from "@/features/common/components/ui/button/Button";

interface FormData {
  email: string;
  userType: "OWNER" | "STAFF";
}

interface ResetState {
  loading: boolean;
  message: string | null;
  error: string | null;
}

const ResetPassword = () => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    userType: "OWNER",
  });
  
  const [resetState, setResetState] = useState<ResetState>({
    loading: false,
    message: null,
    error: null,
  });
  
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.email) {
      newErrors.email = "이메일을 입력해주세요.";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = "유효한 이메일 주소를 입력해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setResetState({ loading: true, message: null, error: null });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/reset/password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "비밀번호 재발급 실패");
      }

      setResetState({
        loading: false,
        message: "임시 비밀번호가 발급되었습니다. 이메일을 확인해주세요.",
        error: null
      });
      
      setFormData({ email: "", userType: "OWNER" });
      
    } catch (error) {
      setResetState({
        loading: false,
        message: null,
        error: error instanceof Error ? error.message : "비밀번호 재발급에 실패했습니다. 다시 시도해주세요."
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center min-h-screen">
      <h1 className={styles.subtitle}>비밀번호 재발급</h1>
      
      {resetState.message && (
        <p className="mb-4 text-sm text-green-500">
          {resetState.message}
        </p>
      )}
      
      {resetState.error && (
        <p className="mb-4 text-sm text-red-500">
          {resetState.error}
        </p>
      )}

      <div className="flex gap-4 m-2">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name="userType"
            value="OWNER"
            checked={formData.userType === "OWNER"}
            onChange={handleChange}
            className="form-radio appearance-none relative h-5 w-5 border border-gray-300 rounded-full 
             before:absolute before:inset-0 before:w-full before:h-full before:rounded-full before:border before:border-gray-300 
             checked:before:border-[#F27B39] checked:after:absolute checked:after:inset-[4px] checked:after:bg-[#F27B39] 
             checked:after:rounded-full"
          />
          <span>점주</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name="userType"
            value="STAFF"
            checked={formData.userType === "STAFF"}
            onChange={handleChange}
            className="form-radio appearance-none relative h-5 w-5 border border-gray-300 rounded-full 
             before:absolute before:inset-0 before:w-full before:h-full before:rounded-full before:border before:border-gray-300 
             checked:before:border-[#F27B39] checked:after:absolute checked:after:inset-[4px] checked:after:bg-[#F27B39] 
             checked:after:rounded-full"
          />
          <span>직원</span>
        </label>
      </div>

      <input
        type="email"
        name="email"
        placeholder="이메일 입력"
        value={formData.email}
        onChange={handleChange}
        className="border p-2 m-2 w-64 rounded"
      />
      {errors.email && (
        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
      )}

      <Button variant="orange">비밀번호 재발급</Button>

      <div className="w-64 h-px bg-gray-300 my-6"></div>

      <div className="text-sm">
        <span className="text-gray-600">이미 계정이 있으신가요? </span>
        <Link href="/login" className="text-orange-500 hover:text-orange-600">
          로그인
        </Link>
      </div>
    </form>
  );
};

export default ResetPassword;