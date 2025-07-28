// src/app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  // limpa cookies
  const res = NextResponse.json({ success: true });
  res.cookies.set("sb-access-token", "", { path: "/", maxAge: 0 });
  res.cookies.set("sb-refresh-token", "", { path: "/", maxAge: 0 });
  return res;
}
