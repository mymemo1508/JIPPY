import { Card, CardContent, CardHeader, CardTitle } from '@/features/common/components/ui/card/Card';

interface LowStockItem {
    stockName: string;
    soldPercentage: number;
    remainingStock: number;
  }
  
  interface StockStatusData {
    storeId: number;
    hasLowStock: boolean;
    lowStockList: LowStockItem[];
  }
  
  interface LowStockStatusProps {
    data: StockStatusData | null;
  }

const LowStockStatus: React.FC<LowStockStatusProps> = ({ data }) => {
    if (!data?.lowStockList || data.lowStockList.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>재고 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-l-4 border border-gray-200 border-l-green-500 bg-white p-4 rounded-lg">
              <p className="font-semibold text-green-600">정상</p>
              <p className="text-green-700">부족한 재고가 없습니다</p>
            </div>
          </CardContent>
        </Card>
      );
    }
  
    return (
      <Card>
        <CardContent>
          <div className="max-h-[240px] mt-5 overflow-y-auto space-y-4">
            {data.lowStockList.map((item, index) => (
              <div key={index} className="border-l-4 border border-gray-200 border-l-red-500 bg-white p-4 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <p className="font-semibold text-red-600">주의</p>
                  </div>
                  <div className="flex items-center space-x-4 text-gray-700">
                    <p>판매율: {item.soldPercentage}%</p>
                    <p>남은 수량: {item.remainingStock}</p>
                  </div>
                </div>
                <p className="text-gray-900">{item.stockName}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };
  
  export default LowStockStatus;