"use client";

import React from "react";
import { Input } from "@/features/common/components/ui/input/Input";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  customInput?: React.ReactNode;
  showCheckIcon?: boolean;
  isValid?: boolean;
}

const CheckIcon = ({ isValid }: { isValid: boolean }) => {
  return (
    <div 
      className={`
        flex items-center justify-center flex-shrink-0 
        w-5 h-5 rounded pointer-events-none
        ${isValid ? "bg-[#F27B39]" : "bg-white border border-[#EBEBEB]"}
      `}
    >
      <Check 
        className="text-white w-3 h-3"
      />
    </div>
  );
};

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  required,
  placeholder,
  maxLength,
  disabled,
  customInput,
  showCheckIcon = false,
  isValid = false,
}) => (
  <div className="mb-4">
    <label className="block text-sm font-medium mb-2">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {customInput ? (
        customInput
      ) : (
        <Input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          className={cn(
            "bg-white",
            error && "border-red-500",
            showCheckIcon && "pr-10" // 체크 아이콘을 위한 오른쪽 패딩 추가
          )}
        />
      )}
      {showCheckIcon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <CheckIcon isValid={isValid} />
        </div>
      )}
    </div>
    {error && (
      <p className="text-red-500 text-sm mt-1">
        {error}
      </p>
    )}
  </div>
);