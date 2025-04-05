import { useEffect, useState } from "react";

export interface UserInfo {
  userName: string | null;
  userId: number | null;
  staffType: string | null;
  storeIdList: number[];
}

const useUserInfo = (): UserInfo => {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    userName: null,
    userId: null,
    staffType: null,
    storeIdList: [],
  });

  useEffect(() => {
    if (typeof document !== "undefined") {
      const cookies = document.cookie.split("; ");
      const findCookie = (name: string): string | null => {
        const cookie = cookies.find((row) => row.startsWith(`${name}=`));
        return cookie ? cookie.split("=")[1] : null;
      };

      const encodedUserName = findCookie("userName");
      const userName = encodedUserName
        ? decodeURIComponent(encodedUserName)
        : null;

      const userIdStr = findCookie("userId");
      const userId = userIdStr ? Number(userIdStr) : null;

      const staffType = findCookie("staffType");

      const storeIdListStr = findCookie("storeIdList");
      let storeIdList: number[] = [];
      if (storeIdListStr) {
        try {
          // URL 디코딩 후 JSON 파싱 (예: "[1,7]")
          const decoded = decodeURIComponent(storeIdListStr);
          storeIdList = JSON.parse(decoded);
        } catch (error) {
          console.error("storeIdList 쿠키 파싱 오류:", error);
        }
      }

      setUserInfo({ userName, userId, staffType, storeIdList });
    }
  }, []);

  return userInfo;
};

export default useUserInfo;
