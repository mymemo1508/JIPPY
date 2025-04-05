import React from 'react';
import usePrediction from '@/features/dashboard/customer/hooks/usePrediction';

const categoryMapping: { [key: string]: string } = {
  "1": "서비스",
  "2": "실시간 서비스",
  "3": "제품관련",
  "4": "기타",
};


interface MLAnalysisProps {
  storeId: number;
}

const MLAnalysis: React.FC<MLAnalysisProps> = ({ storeId }) => {
  const { data, loading, error } = usePrediction(storeId);

  if (loading) return <div className="p-6 text-center text-gray-700">분석 데이터를 불러오는 중...</div>;
  if (error) return <div className="p-6 text-center text-red-500 font-bold">오류: {error}</div>;
  if (!data) return null;

  return (
    <div className="py-6 px-2 max-w-4xl mx-auto">
      {/* 피드백 총계 카드 */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="flex flex-row items-center justify-between bg-[#F27B39] text-white p-4 rounded-xl shadow-md">
          <h3 className="text-base font-semibold">긍정 피드백</h3>
          <p className="text-2xl font-bold">{data.positive_count}</p>
        </div>
        <div className="flex flex-row items-center justify-between bg-gray-200 text-gray-800 p-4 rounded-xl shadow-md">
          <h3 className="text-base font-semibold text-gray-600">부정 피드백</h3>
          <p className="text-2xl font-bold text-gray-700">{data.negative_count}</p>
        </div>
      </div>

      {/* 키워드 영역 */}
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h5 className="text-lg font-bold text-[#F27B39] mb-2">긍정 키워드</h5>
            <div className="flex flex-wrap gap-2">
              {data.positive_keywords.map((kw, idx) => (
                <span key={idx} className="bg-[#F27B39] text-white px-4 py-1 rounded-full text-sm font-medium shadow-md">
                  {kw}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h5 className="text-lg font-bold text-gray-600 mb-2">부정 키워드</h5>
            <div className="flex flex-wrap gap-2">
              {data.negative_keywords.map((kw, idx) => (
                <span key={idx} className="bg-gray-300 text-gray-800 px-4 py-1 rounded-full text-sm font-medium shadow-md">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 긍정 / 부정 샘플 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 긍정 샘플 */}
        <div>
          <div className="space-y-4">
            {data.positive_samples.map((sample, idx) => (
              <div key={idx} className="border-l-4 border-[#F27B39] bg-orange-50 p-4 rounded-lg shadow">
                <p className="text-xs text-gray-500">{sample.created_at}</p>
                <p className="font-semibold text-gray-700">{categoryMapping[sample.category] || sample.category}</p>
                <p className="text-gray-800">{sample.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 부정 샘플 */}
        <div>
          <div className="space-y-4">
            {data.negative_samples.map((sample, idx) => (
              <div key={idx} className="border-l-4 border-gray-500 bg-gray-100 p-4 rounded-lg shadow">
                <p className="text-xs text-gray-500">{sample.created_at}</p>
                <p className="font-semibold text-gray-600">{categoryMapping[sample.category] || sample.category}</p>
                <p className="text-gray-700">{sample.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MLAnalysis;
