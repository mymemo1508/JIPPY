"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/slices/userSlice";
import { useRouter } from "next/navigation";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 🔥 클라이언트 사이드에서만 실행하도록 변경
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("사용자");

  useEffect(() => {
    if (typeof document !== "undefined") {
      // document가 클라이언트에서만 실행됨을 보장
      const token =
        document.cookie
          .split("; ")
          .find((cookie) => cookie.startsWith("accessToken="))
          ?.split("=")[1] || null;

      const encodedUserName =
        document.cookie
          .split("; ")
          .find((cookie) => cookie.startsWith("userName="))
          ?.split("=")[1] || "";

      setAccessToken(token);
      setUserName(decodeURIComponent(encodedUserName) || "사용자");
    }
  }, []); // 👈 useEffect 안에서 실행 (클라이언트 사이드에서만 실행됨)

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
      setAccessToken(null);
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
            <Link href="/pos/order" className={styles.logoText}>
              Jippy
            </Link>
          </div>

          <div className={styles.desktopMenu}>
            <div className={styles.navLinks}>
              <Link href="/pos/order" className={styles.navLink}>
                주문
              </Link>
              <Link href="/pos/payment/history" className={styles.navLink}>
                결제내역
              </Link>
              <Link href="/shop" className={styles.navLink}>
                매장 목록
              </Link>
            </div>

            <Link href="/qr" className={styles.qrButton}>
              <Image
                src="/images/NavbarQR.svg"
                alt="QR Code"
                fill
                className={styles.qrImage}
              />
            </Link>

            {accessToken ? (
              <div className={styles.profileDropdown} ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={styles.profileButton}
                >
                  <span>{userName ? `${userName} 님` : "사용자"}</span>
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
