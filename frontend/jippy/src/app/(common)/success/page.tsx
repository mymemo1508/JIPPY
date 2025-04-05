import Link from "next/link";

export const dynamic = "force-static"; // 정적 페이지 강제 설정

export default function FeedbackPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white w-full max-w-md sm:max-w-lg md:max-w-xl min-h-screen flex flex-col justify-center items-center px-8 py-12 shadow-lg">
        {/* 상단 영역 (제목) */}
        <div className="flex-none self-start w-full">
          <h2 className="text-2xl font-bold mb-6">완료</h2>
        </div>

        {/* 완료 메시지 */}
        <div className="flex-grow flex flex-col items-center justify-center">
          {/* 아이콘 */}
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#FF5C00]">
            <svg
              className="w-10 h-10 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <p className="text-xl font-semibold mt-6">완료 되었습니다!</p>
          <p className="text-xl font-bold text-[#FF5C00] mt-2">감사합니다!</p>
        </div>

        {/* 버튼 */}
        <div className="flex-none mt-8 w-full">
          <Link href="/" className="block w-full bg-[#FF5C00] text-white py-4 rounded-lg hover:bg-[#E65200] transition-all text-lg font-bold text-center">
            확인
          </Link>
        </div>
      </div>
    </div>
  );
}
