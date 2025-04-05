import { Card } from "@/features/common/components/ui/card/Card";
import { CalendarClock } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface ScheduleRequest {
  uuid: string;
  staffId: number;
  staffName: string;
  beforeYear: string;
  beforeCheckIn: string;
  beforeCheckOut: string;
  newYear: string;
  newCheckIn: string;
  newCheckOut: string;
}

interface ScheduleChangeListProps {
  storeId: number;
}

const ScheduleChangeList: React.FC<ScheduleChangeListProps> = ({ storeId }) => {
  const [requests, setRequests] = useState<ScheduleRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/attendance/${storeId}/tempChange/list`
      );
      const data = await response.json();

      if (data.success) {
        setRequests(data.data.requestSchedule);
      } else {
        console.error("근무 변경 요청 목록 조회 실패");
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [storeId]);

  const handleApprove = async (request: ScheduleRequest) => {
    try {
      console.log(request);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/attendance/${storeId}/tempChange/${request.staffId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uuid: request.uuid,
            newDate: request.newYear,
            newStartTime: request.newCheckIn,
            newEndTime: request.newCheckOut,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("근무 변경 요청이 승인되었습니다.");
        fetchRequests();
      } else {
        alert("근무 변경 요청 승인에 실패했습니다.");
      }
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  if (isLoading) return null;

  return (
    <Card className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-[#3D3733]">
              근무 변경 요청 목록
            </h2>
            {requests.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-[#F27B39]/10 text-jippy-orange rounded-full text-[15px]">
                총 {requests.length}건
              </span>
            )}
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-gray-500">
            <CalendarClock className="h-12 w-12 mb-4 text-gray-300" />
            <p className="text-center mb-1">근무 변경 요청이 없습니다.</p>
            <p className="text-sm text-center text-gray-400">
              새로운 근무 변경 요청이 들어오면 이곳에 표시됩니다.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div
                key={request.uuid}
                className="bg-gray-50 rounded-lg p-4 border border-gray-100"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h3 className="font-medium text-[15px]">
                      {request.staffName}
                    </h3>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">
                        변경 전 :{" "}
                        <span className="text-gray-700">
                          {formatDate(request.beforeYear)}{" "}
                          {request.beforeCheckIn} - {request.beforeCheckOut}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        변경 후 :{" "}
                        <span className="text-[#F27B39]">
                          {formatDate(request.newYear)} {request.newCheckIn} -{" "}
                          {request.newCheckOut}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleApprove(request)}
                    className="px-4 py-2 bg-jippy-orange text-white rounded-lg hover:bg-[#D8692E] transition-colors"
                  >
                    승인
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ScheduleChangeList;
