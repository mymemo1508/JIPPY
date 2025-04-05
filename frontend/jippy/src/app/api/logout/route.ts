import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = cookies();
  cookieStore.set("accessToken", "", { maxAge: -1 }); // 쿠키 삭제
  cookieStore.set("refreshToken", "", { maxAge: -1 }); // 쿠키 삭제
  return NextResponse.redirect("/");
}
