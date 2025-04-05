"use client";

import { usePathname } from "next/navigation";
import "./globals.css";
import BottomNavBar from "@/features/common/components/layout/navbar/BottomNavBar";

const hideBottomNavbarPaths = ["/login", "/signup"];

const StaffLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  const isHiddenPath = hideBottomNavbarPaths.some((path) =>
    pathname.startsWith(path)
  );

  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1 overflow-auto">{children}</main>
      {!isHiddenPath && (
        <div className="h-[95px]">
          <BottomNavBar />
        </div>
      )}
    </div>
  );
};

export default StaffLayout;
