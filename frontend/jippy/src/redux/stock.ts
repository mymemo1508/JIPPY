let API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/stock/`; // 실제 API base url으로 수정

export async function fetchStockData(storeId: number) {
    API_URL += `${storeId}/select`;
    try {
      const response = await fetch(API_URL, { cache: "no-store" });
      if (!response.ok) throw new Error("데이터를 불러오는데 실패했습니다.");
      const data = await response.json();
      return data?.data?.inventory || [];
    } catch (error) {
      console.error(error);
      return [];
    }
  }