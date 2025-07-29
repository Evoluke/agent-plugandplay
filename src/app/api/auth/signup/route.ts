// src/app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import { supabaseadmin } from "@/lib/supabase";
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  const { name, email, password } = await req.json();
  if (!name || !email || !password) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  }

  const { data, error } = await supabaseadmin.auth.admin.createUser({
    email,
    password,
    user_metadata: { name },
    email_confirm: true,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 409 });
  }

  const userId = data.user.id;
  // 2) insere na tabela business (service role key ignora RLS)
  const { error: bizError } = await supabase
    .from('client')
    .insert({ user_id: userId, business_name: name});
  if (bizError) {
    return NextResponse.json({ error: bizError.message }, { status: 500 });
  }

  return NextResponse.json({ user: data.user }, { status: 201 });
}