'use client'

import PageTitle from "@/features/common/components/layout/title/PageTitle";
import {
    ApiResponse,
    Feedback
} from "@/features/feedback/types/feedback";
import { useEffect, useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

const CATEGORIES: { value: string; label: string; }[] = [
    { value: 'ALL', label: '전체' },
    { value: 'SERVICE', label: '서비스' },
    { value: 'PRODUCT', label: '상품' },
    { value: 'LIVE', label: '실시간' },
    { value: 'ETC', label: '기타' }
];

const getCookieValue = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null;
    }
    return null;
};

const FeedbackPage = () => {
    const router = useRouter();
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showScrollTop, setShowScrollTop] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);

    const fetchFeedbacks = async (category: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const encodedStoreIdList = getCookieValue('storeIdList');
            const userId = getCookieValue('userId');

            if (!encodedStoreIdList || !userId) {
                router.push("/login");
                return;
              }

            const decodedStoreIdList = decodeURIComponent(encodedStoreIdList);
            const storeIdList = JSON.parse(decodedStoreIdList);
            const storeId = storeIdList[0];

            const url = category === 'ALL'
                ? `${process.env.NEXT_PUBLIC_API_URL}/api/feedback/${storeId}/select`
                : `${process.env.NEXT_PUBLIC_API_URL}/api/feedback/${storeId}/select/${category}`

            const response = await fetch(url);
            const responseData: ApiResponse<Feedback[]> = await response.json();

            if (!responseData.success) {
                throw new Error(
                    responseData.message || "피드백을 불러오는데 실패했습니다."
                );
            }

            const sortedFeedbacks = responseData.data.sort((a, b) => {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });

            setFeedbacks(sortedFeedbacks);
        } catch (error) {
            setError("피드백을 불러오는데 실패했습니다");
            console.error("피드백 로딩 실패: ", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedbacks(selectedCategory);

        const handleScroll = () => {
            if (typeof window !== 'undefined') {
                const scrollY = window.pageYOffset || document.documentElement.scrollTop;
                setShowScrollTop(scrollY > 200);
            }
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('scroll', handleScroll, { passive: true });
            return () => window.removeEventListener('scroll', handleScroll);
        }
    }, [selectedCategory]);

    const scrollToTop = () => {
        const element = document.getElementById('page-top');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        setIsCategoryOpen(false);
    }

    const selectedCategoryLabel = CATEGORIES.find(cat => cat.value === selectedCategory)?.label;

    if (isLoading) {
        return (
            <div id="page-top">
                <PageTitle />
                <div className="p-4">
                    <div className="bg-white rounded-lg shadow p-6 flex flex-col h-[640px]">
                        <h1 className="text-[24px] font-bold text-black pb-3">💬 피드백</h1>
                        <div className="flex justify-center items-center h-full">로딩중...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div id="page-top">
                <PageTitle />
                <div className="p-4 text-center text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <>
            <div id="page-top">
                <PageTitle />
                <div className="p-4">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h1 className="text-[24px] font-bold text-black pb-3">💬 피드백</h1>

                        <div className="relative px-2 pb-4">
                            <button
                                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                className="w-full p-3 text-left flex justify-between items-center hover:bg-gray-50 border rounded-lg transition-colors"
                            >
                                <span className="px-1">{selectedCategoryLabel}</span>
                                {isCategoryOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>

                            {isCategoryOpen && (
                                <div className="absolute top-full left-0 w-full bg-white shadow-lg rounded-lg z-10 mt-1 border">
                                    {CATEGORIES.map(({ value, label }) => (
                                        <button
                                            key={value}
                                            onClick={() => handleCategoryChange(value)}
                                            className={`w-full p-4 text-left hover:bg-gray-50 transition-colors
                                                ${selectedCategory === value ? 'text-[#ff5c00] font-medium' : ''}
                                            `}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center items-center py-8">로딩중...</div>
                        ) : error ? (
                            <div className="text-center text-red-500">{error}</div>
                        ) : feedbacks.length > 0 ? (
                            <div>
                                {feedbacks.map((feedback) => (
                                    <div key={feedback.id} className="border-b py-3 last:border-b-0">
                                        <div className="transition-colors p-2">
                                            <div className="flex justify-between items-center">
                                                <div className="flex-1">
                                                    <p className="font-medium">{feedback.content}</p>
                                                    <p className="text-sm text-gray-500">{feedback.createdAt}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">등록된 피드백이 없습니다.</div>
                        )}
                    </div>
                </div>
            </div>

            <button
                onClick={scrollToTop}
                className={`fixed bottom-32 right-8 w-12 h-12 bg-[#ff5c00] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#ff7c33] transition-all ${showScrollTop ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                aria-label="맨 위로 스크롤"
            >
                <ChevronUp size={24} />
            </button>
        </>
    );
}

export default FeedbackPage;