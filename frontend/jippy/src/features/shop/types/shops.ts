export interface Shop {
  id: number;
  userOwnerId: number;
  name: string;
  representativeName?: string;
  address: string;
  openingDate: string;
  totalCash: number;
  businessRegistrationNumber: string;
}

export interface ApiResponse {
  code: number;
  success: boolean;
  data: Shop[];
}

export interface OCRResponse {
  data: {
    businessNumber: string; // 사업자등록번호 (하이픈 제거된 형식)
    corporateName: string; // 법인명(단체명) 또는 상호
    representativeName: string; // 대표자명
    openDate: string; // 개업연월일 (yyyy-MM-dd hh:mm:ss 형태)
  };
}

export interface FormData {
  name: string;
  address: string;
  openingDate: string;
  representativeName: string;
  businessRegistrationNumber: string;
  latitude: string;
  longitude: string;
}

export interface FormErrors {
  name?: string;
  address?: string;
  businessRegistrationNumber?: string;
  representativeName?: string;
  openingDate?: string;
}
