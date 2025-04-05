import { Middleware } from "redux";
import { logout } from "./slices/userSlice";

export const refreshAccessToken = async (refreshToken: string): Promise<string> => {
 try {
   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`, {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
     },
     body: JSON.stringify({ refreshToken }),
   });

   if (!response.ok) {
     throw new Error("토큰 갱신 실패");
   }

   const data = await response.json();
   return data.accessToken;
 } catch (error) {
   console.error("토큰 갱신 중 오류:", error);
   throw error;
 }
};

const isTokenExpired = (token: string): boolean => {
 try {
   const decoded = JSON.parse(atob(token.split(".")[1]));
   return decoded.exp < Date.now() / 1000;
 } catch (error: unknown) {
   console.error("토큰 디코딩 에러:", error);
   return true;
 }
};

interface ApiCallAction {
  type: string;
  payload: {
    headers?: Record<string, string>;
    [key: string]: unknown;
  };
}

const authMiddleware: Middleware = (store) => (next) => async (action: unknown) => {
  if (
    typeof action === "object" && 
    action !== null && 
    "type" in action && 
    "payload" in action &&
    (action as ApiCallAction).type === "api/callBegan"
  ) {
    const apiAction = action as ApiCallAction;

    if (apiAction.payload) {
      let token = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!token) {
        store.dispatch(logout());
        return next(action);
      }

      if (isTokenExpired(token)) {
        try {
          if (!refreshToken) {
            store.dispatch(logout());
            return next(action);
          }

          token = await refreshAccessToken(refreshToken);
          localStorage.setItem("token", token);
        } catch (error: unknown) {
          console.error("인증 미들웨어 에러:", error);
          store.dispatch(logout());
          return next(action);
        }
      }

      if (apiAction.payload.headers) {
        apiAction.payload.headers = {
          ...apiAction.payload.headers,
          "Authorization": `Bearer ${token}`,
        };
      } else {
        (apiAction.payload as { headers: Record<string, string> }).headers = {
          "Authorization": `Bearer ${token}`,
        };
      }
    }
  }

  return next(action);
};

export default authMiddleware;