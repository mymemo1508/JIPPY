// src/utils/cookies.ts
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; refreshToken=`);
  
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  
  return null;
}

export function setRefreshToken(refreshToken: string, expiryDays = 7): void {
  const date = new Date();
  date.setTime(date.getTime() + (expiryDays * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `refreshToken=${refreshToken};${expires};path=/`;
}

export function removeRefreshToken(): void {
  document.cookie = "refreshToken=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
}