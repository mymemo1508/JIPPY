"use client";

import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { Archivo_Black } from "next/font/google";
import "@/app/globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { usePathname } from "next/navigation";
import Navbar from "@/features/common/components/layout/navbar/Navbar";
import { useEffect } from "react";
import { registerServiceWorker } from "@/utils/serviceWorkerRegistration";

const archivoBlack = Archivo_Black({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-archivo-black",
  display: "swap",
});

const hideNavbarPaths = [
  "/login",
  "/signup",
  "/attendance",
  "/calendar",
  "/owner",
  "/notifications",
  "/todo",
  "/feedback",
  "/chatting",
  "/shop/create",
  "/reset",
  "/shop"
];

const RootLayoutClient = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  useEffect(() => {
    registerServiceWorker();
  }, []);

  const isHiddenPath = hideNavbarPaths.some((path) =>
    pathname.startsWith(path)
  );
  const isMainPage = pathname === "/";
  const showNavbar = !isMainPage && !isHiddenPath;

  return (
    <html lang="ko" className={`${archivoBlack.variable}`}>
      <body>
        {/* provider : Redux store를 React 애플리케이션에 연결해줌 */}
        <Provider store={store}>
          <div className="main-layout">
            {showNavbar && (
              <div className="nav-space">
                <Navbar />
              </div>
            )}
            <div className="page-content">{children}</div>
            <div id="modal-root"></div>
            <ToastContainer
              toastClassName="custom-toast"
              progressClassName="custom-toast-progress"
            />
          </div>
        </Provider>
      </body>
    </html>
  );
};

export default RootLayoutClient;
