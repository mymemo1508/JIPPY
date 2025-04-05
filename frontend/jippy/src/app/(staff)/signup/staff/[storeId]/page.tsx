"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/features/common/components/ui/button";

interface SignupStaffProps {
  params: {
    storeId: number;
  };
}

const SignupStaff = ({ params }: SignupStaffProps) => {
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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/signup/staff`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            storeId: params.storeId,
            userType: "STAFF",
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          router.push("/login");
        }
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
    // <div className="flex flex-col items-center justify-center min-h-screen p-6">
    //   <div className="w-full max-w-screen-sm mx-auto bg-white border border-gray-300 rounded-lg p-6">
    //     <h1 className="text-2xl font-bold mb-8 text-center">직원 회원가입</h1>
    //     {error && (
    //       <div className="mb-4 p-3 bg-red-100 text-red-600 rounded text-sm">
    //         {error}
    //       </div>
    //     )}
    //     <form onSubmit={handleSubmit} className="space-y-6">
    //       <div className="grid grid-cols-2 gap-4">
    //         <div className="space-y-2">
    //           <label className="block text-sm font-medium">이름</label>
    //           <input
    //             type="text"
    //             name="name"
    //             placeholder="이름을 입력해주세요"
    //             className="w-full p-2 border rounded bg-gray-50 text-[12px]"
    //             value={formData.name}
    //             onChange={handleChange}
    //             disabled={isLoading}
    //           />
    //         </div>
    //         <div className="space-y-2">
    //           <label className="block text-sm font-medium">생년월일</label>
    //           <input
    //             type="text"
    //             name="age"
    //             placeholder="YYYY-MM-DD"
    //             className="w-full p-2 border rounded bg-gray-50 text-[12px]"
    //             value={formData.age}
    //             onChange={handleChange}
    //             disabled={isLoading}
    //           />
    //         </div>
    //       </div>
    //       <div className="space-y-2">
    //         <label className="block text-sm font-medium">이메일</label>
    //         <input
    //           type="email"
    //           name="email"
    //           placeholder="이메일을 입력해주세요 (ex. jippy@gmail.com)"
    //           className="w-full p-2 border rounded bg-gray-50 text-[12px]"
    //           value={formData.email}
    //           onChange={handleChange}
    //           disabled={isLoading}
    //         />
    //       </div>
    //       <div className="space-y-2">
    //         <label className="block text-sm font-medium">비밀번호</label>
    //         <input
    //           type="password"
    //           name="password"
    //           placeholder="비밀번호를 입력해주세요"
    //           className="w-full p-2 border rounded bg-gray-50 text-[12px]"
    //           value={formData.password}
    //           onChange={handleChange}
    //           disabled={isLoading}
    //         />
    //       </div>
    //       <button
    //         type="submit"
    //         className={`w-full p-3 text-white rounded ${
    //           isLoading
    //             ? "bg-gray-400 cursor-not-allowed"
    //             : "bg-gray-900 hover:bg-gray-800"
    //         }`}
    //         disabled={isLoading}
    //       >
    //         {isLoading ? "처리중..." : "가입하기"}
    //       </button>
    //     </form>
    //   </div>
    // </div>
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center justify-center min-h-screen p-6"
    >
      <h1 className="text-2xl font-bold mb-8">직원 회원가입</h1>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-600 rounded text-sm w-64">
          {error}
        </div>
      )}

      <div className="space-y-6 w-64">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              이름
            </label>
            <input
              type="text"
              name="name"
              placeholder="이름을 입력해주세요"
              className="w-full p-2 text-[12px] border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              생년월일
            </label>
            <input
              type="text"
              name="age"
              placeholder="YYYY-MM-DD"
              className="w-full p-2 text-[12px] border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={formData.age}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            이메일
          </label>
          <input
            type="email"
            name="email"
            placeholder="이메일을 입력해주세요 (ex. jippy@gmail.com)"
            className="w-full p-2 text-[12px] border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            비밀번호
          </label>
          <input
            type="password"
            name="password"
            placeholder="비밀번호를 입력해주세요"
            className="w-full p-2 text-[12px] border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        <Button variant="orange">{isLoading ? "처리중..." : "가입하기"}</Button>
      </div>
    </form>
  );
};

export default SignupStaff;
