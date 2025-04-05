"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const SignupOwner = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/signup/owner`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userType: "OWNER",
        }),
      });
      console.log('요청 데이터:', {
        ...formData,
        userType: "OWNER",
      });
      if (response.ok) {
        await response.json();
        router.push("/login");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "회원가입에 실패했습니다.");
      }
    } catch {
      setError("서버와의 연결에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
      <h1 
        className="text-4xl font-bold text-orange-500 mb-8 cursor-pointer hover:text-orange-600 transition-colors"
        onClick={() => router.push('/')}
      >
        Jippy
      </h1>
      <div className="w-full max-w-screen-sm mx-auto bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
        <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">점주 회원가입</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded text-sm">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">이름</label>
              <input
                type="text"
                name="name"
                placeholder="이름을 입력해주세요"
                className="w-full p-2 border rounded bg-gray-50 text-[12px] focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">생년월일</label>
              <input
                type="text"
                name="age"
                placeholder="YYYY-MM-DD"
                className="w-full p-2 border rounded bg-gray-50 text-[12px] focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                value={formData.age}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">이메일</label>
            <input
              type="email"
              name="email"
              placeholder="이메일을 입력해주세요 (ex. jippy@gmail.com)"
              className="w-full p-2 border rounded bg-gray-50 text-[12px] focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">비밀번호</label>
            <input
              type="password"
              name="password"
              placeholder="비밀번호를 입력해주세요"
              className="w-full p-2 border rounded bg-gray-50 text-[12px] focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            className={`w-full p-3 text-white rounded transition-colors ${
              isLoading 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-orange-500 hover:bg-orange-600"
            }`}
            disabled={isLoading}
          >
            {isLoading ? "처리중..." : "가입하기"}
          </button>

          <div className="h-px bg-gray-200 my-6"></div>

          <div className="text-center text-sm">
            <span className="text-gray-600">이미 계정이 있으신가요? </span>
            <Link href="/login" className="text-orange-500 hover:text-orange-600 font-medium">
              로그인
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupOwner;