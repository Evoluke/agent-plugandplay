import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { createServerClient } from "@/lib/supabaseClient";
import { supabaseadmin } from "@/lib/supabaseAdmin";

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", requestUrl));
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data?.user) {
    console.error("Erro ao trocar o código por sessão:", error?.message);
    return NextResponse.redirect(new URL("/login?error=oauth", requestUrl));
  }

  const user = data.user;
  const userId = user.id;

  const { data: company, error: companyError } = await supabase
    .from("company")
    .select("profile_complete")
    .eq("user_id", userId)
    .maybeSingle();

  if (companyError && companyError.code !== "PGRST116") {
    console.error("Erro ao buscar registro da empresa:", companyError.message);
  }

  let profileComplete = company?.profile_complete ?? false;

  if (!company) {
    const companyName =
      typeof user.user_metadata?.name === "string" && user.user_metadata.name.trim().length > 0
        ? user.user_metadata.name
        : user.email ?? null;

    const { error: insertError } = await supabaseadmin
      .from("company")
      .insert({
        user_id: userId,
        company_name: companyName,
        profile_complete: false,
      });

    if (insertError && insertError.code !== "23505") {
      console.error("Erro ao criar registro da empresa:", insertError.message);
      return NextResponse.redirect(new URL("/login?error=company", requestUrl));
    }

    profileComplete = false;
  }

  const redirectPath = profileComplete ? "/dashboard" : "/complete-profile";

  return NextResponse.redirect(new URL(redirectPath, requestUrl));
}
