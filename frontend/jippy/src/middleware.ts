import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { nextUrl, cookies } = request;
  const urlPath = nextUrl.pathname;
  const staffType = cookies.get("staffType")?.value;
  const loginType = cookies.get("loginType")?.value;

  console.log("I'm in middleware"); // 삭제 필요
  if (!staffType || !loginType) {
    console.log("오류1");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (urlPath.startsWith("/owner") && loginType !== "OWNER") {
    console.log("오류2");
    return NextResponse.redirect(new URL("/error", request.url));
  } else if (urlPath.startsWith("/pos")) {
    if (loginType !== "POS") {
      console.log("오류3");
      return NextResponse.redirect(new URL("/error", request.url));
    }
  } else if (
    urlPath.startsWith("/attendance") ||
    urlPath.startsWith("/calendar") ||
    urlPath.startsWith("/chatting") ||
    urlPath.startsWith("/feedback") ||
    urlPath.startsWith("/notifications") ||
    urlPath.startsWith("/signup/staff") ||
    urlPath.startsWith("/todo")
  ) {
    if (loginType !== "STAFF") {
      console.log("오류4");
      return NextResponse.redirect(new URL("/error", request.url));
    }
  } else if (urlPath.startsWith("/shop") && loginType === "STAFF") {
    console.log("오류5");
    return NextResponse.redirect(new URL("/error", request.url));
  } else if (urlPath.startsWith("/signup/owner") && staffType !== "OWNER") {
    console.log("오류6");
    return NextResponse.redirect(new URL("/error", request.url));
  } else if (urlPath.startsWith("/login") || urlPath.startsWith("/signup")) {
    if (loginType) {
      console.log("오류7");
      return NextResponse.redirect(new URL("/error", request.url));
    }
  }

  const userAgent = request.headers.get("user-agent");
  // console.log("User Agent:", userAgent);

  const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent || "");
  // console.log("모바일 여부:", isMobile);

  if (isMobile && request.nextUrl.pathname.startsWith("/(staff)")) {
    // console.log("리다이렉트 시도:", "/(staff)" + request.nextUrl.pathname);
    return NextResponse.redirect(
      new URL("/(staff)" + request.nextUrl.pathname, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/attendance",
    "/calendar",
    "/chatting",
    "/feedback",
    "/notifications",
    "/todo",
    "/owner/:path*",
    "/pos/:path*",
    "/shop/:path*",
  ],
};
