import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-static"; // 정적 페이지 강제 설정

export default function FeedbackPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white w-full max-w-md sm:max-w-lg md:max-w-xl min-h-screen flex flex-col justify-center items-center px-8 py-12 shadow-lg">
         <div className="flex-grow flex flex-col items-center justify-center">
          {/* 아이콘 */}
          <Image
            src="/images/AccessDeny.png"
            alt="Access Denied"
            width={192}  // w-48 = 12rem = 192px
            height={192}
          />
          <p className="text-xl font-semibold mt-6">잘못된 접근이거나 요청하신</p>
          <p className="text-xl font-bold text-[#FF5C00] mt-2">페이지를 찾을 수 없습니다.</p>
        </div>

        {/* 버튼 */}
        <div className="flex-none mt-8 w-full">
          <Link href="/" className="block w-full bg-[#FF5C00] text-white py-4 rounded-lg hover:bg-[#E65200] transition-all text-lg font-bold text-center">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
