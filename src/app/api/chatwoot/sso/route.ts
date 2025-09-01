import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";
import { supabaseadmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function GET() {
  const { user } = await getUserFromCookie();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { data: company, error } = await supabaseadmin
    .from("company")
    .select("chatwoot_id")
    .eq("user_id", user.id)
    .single();

  if (error || !company?.chatwoot_id) {
    return NextResponse.json(
      { error: "Chatwoot ID não encontrado" },
      { status: 404 }
    );
  }

  const baseUrl = process.env.CHATWOOT_BASE_URL;
  const token = process.env.CHATWOOT_PLATFORM_TOKEN;
  if (!baseUrl || !token) {
    return NextResponse.json(
      { error: "SSO não configurado" },
      { status: 500 }
    );
  }

  const resp = await fetch(
    `${baseUrl}/platform/api/v1/users/${company.chatwoot_id}/login`,
    {
      headers: {
        Authorization: `ApiKey ${token}`,
      },
    }
  );

  const data = (await resp.json().catch(() => ({}))) as { url?: string };
  if (!resp.ok || !data.url) {
    return NextResponse.json(
      { error: "SSO indisponível" },
      { status: resp.status || 500 }
    );
  }

  return NextResponse.json({ url: data.url });
}
