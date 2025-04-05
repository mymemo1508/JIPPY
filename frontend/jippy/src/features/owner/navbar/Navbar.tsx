"use client";

import Link from "next/link";
import { Menu, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/slices/userSlice";
import { useRouter } from "next/navigation";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  // 상태 추가 (초기값: null)
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("사용자");

  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window !== "undefined") {
      const cookies = document.cookie.split("; ");

      // accessToken 가져오기
      const token =
        cookies
          .find((cookie) => cookie.startsWith("accessToken="))
          ?.split("=")[1] || null;
      setAccessToken(token);

      // userName 가져오기
      const encodedUserName =
        cookies
          .find((cookie) => cookie.startsWith("userName="))
          ?.split("=")[1] || "";
      setUserName(decodeURIComponent(encodedUserName) || "사용자");
    }
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      if (!accessToken) {
        throw new Error("로그인 세션이 만료되었습니다.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/logout`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("로그아웃 실패");
      }

      dispatch(logout());

      setIsDropdownOpen(false);
      router.push("/");
      alert("성공적으로 로그아웃되었습니다.");
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
      alert(
        error instanceof Error
          ? error.message
          : "로그아웃 중 오류가 발생했습니다."
      );
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.logo}>
            <Link href="/owner" className={styles.logoText}>
              Jippy
            </Link>
          </div>

          <div className={styles.desktopMenu}>
            <div className={styles.navLinks}>
              <Link href="/owner/dashboard/sale" className={styles.navLink}>
                매출
              </Link>
              <Link href="/owner/dashboard/product" className={styles.navLink}>
                상품
              </Link>
              <Link href="/owner/dashboard/stock" className={styles.navLink}>
                재고
              </Link>
              <Link href="/owner/dashboard/staff" className={styles.navLink}>
                직원
              </Link>
              <Link href="/owner/dashboard/customer" className={styles.navLink}>
                고객
              </Link>
              <Link href="/owner/dashboard/qr" className={styles.navLink}>
                QR 관리
              </Link>
              <Link href="/owner/dashboard/chat" className={styles.navLink}>
                채팅
              </Link>
            </div>

            {accessToken ? (
              <div className={styles.profileDropdown} ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={styles.profileButton}
                >
                  <span>{userName} 님</span>
                  <ChevronDown className={styles.dropdownIcon} />
                </button>

                {isDropdownOpen && (
                  <div className={styles.dropdownContent}>
                    <Link href="/update" className={styles.dropdownItem}>
                      마이페이지
                    </Link>
                    <button
                      onClick={handleLogout}
                      className={styles.dropdownButton}
                    >
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className={styles.loginLink}>
                로그인
              </Link>
            )}
          </div>

          <div className={styles.mobileMenuButton}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={styles.mobileMenuIcon}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
