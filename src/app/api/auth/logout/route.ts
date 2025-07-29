// src/app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ success: true });
  // limpa cookie de acesso
  res.cookies.set("sb-access-token", "", {
    path: "/",
    maxAge: 0,
  });
  return res;
}
