// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";


export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    return NextResponse.json({ error: error?.message || "Falha no login" }, { status: 401 });
  }

  const { access_token, refresh_token } = data.session;

  const maxAge = parseInt(process.env.SUPABASE_COOKIE_MAX_AGE!, 10);

  const res = NextResponse.json({ user: data.user });

  res.cookies.set("sb-access-token", access_token, {
    httpOnly: true,
    path: "/",
    maxAge,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.cookies.set("sb-refresh-token", refresh_token, {
    httpOnly: true,
    path: "/",
    expires: new Date(Date.now() + maxAge * 1000),
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return res;
}