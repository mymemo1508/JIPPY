export interface Page {
  name: string;
  path: string;
}

// QR 코드를 생성할 수 있는 페이지 목록
export const QR_PAGES: Page[] = [
  { name: "피드백", path: "/feedback" },
  { name: "직원 등록", path: "/signup" }
] as const;
