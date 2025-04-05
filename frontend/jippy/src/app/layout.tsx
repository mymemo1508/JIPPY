// app/layout.tsx
import RootLayoutClient from "./RootLayoutClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jippy",
  description: "소상공인을 위한 카페 매장 관리 서비스",
  manifest: "/manifest.json", // PWA manifest 추가
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return <RootLayoutClient>{children}</RootLayoutClient>;
};

export default RootLayout;
