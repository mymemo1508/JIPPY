import { useState, useEffect } from "react";

const useUserName = () => {
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    if (typeof document !== "undefined") {
      const cookies = document.cookie.split("; ");
      const userNameCookie = cookies.find((row) => row.startsWith("userName="));
      if (userNameCookie) {
        try {
          const encodedUserName = userNameCookie.split("=")[1];
          const decodedUserName = decodeURIComponent(encodedUserName);
          setUserName(decodedUserName);
        } catch (error) {
          console.error("Error decoding userName cookie:", error);
        }
      }
    }
  }, []);

  return userName;
};

export default useUserName;
