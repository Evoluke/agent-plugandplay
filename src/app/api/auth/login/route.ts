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

  const { access_token, refresh_token, expires_at } = data.session;

  return NextResponse.json({
    user: data.user,
    access_token,
    refresh_token,
    expires_at
  });
}
