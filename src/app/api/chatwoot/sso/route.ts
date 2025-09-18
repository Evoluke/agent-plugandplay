import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserFromCookie } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const { user } = await getUserFromCookie().catch((err) => {
    console.error("[Chatwoot SSO] Error fetching user", err);
    return { user: null };
  });
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const supabase = createRouteHandlerClient({ cookies });
  const { data: company, error } = await supabase
    .from("company")
    .select("chatwoot_user_id")
    .eq("user_id", user.id)
    .single();

  if (error || !company?.chatwoot_user_id) {
    return NextResponse.json(
      { error: "Chatwoot ID não encontrado" },
      { status: 404 }
    );
  }

  const baseUrl = process.env.CHATWOOT_BASE_URL;
  const token = process.env.CHATWOOT_PLATFORM_TOKEN;
  if (!baseUrl || !token) {
    console.error("[Chatwoot SSO] Missing env vars", {
      baseUrl: Boolean(baseUrl),
      token: Boolean(token),
    });
    return NextResponse.json(
      { error: "SSO não configurado" },
      { status: 500 }
    );
  }

  try {
    const resp = await fetch(
      `${baseUrl}/platform/api/v1/users/${company.chatwoot_user_id}/login`,
      {
        headers: {
          api_access_token: `${token}`,
        },
      }
    );

    const text = await resp.text();
    let data: { url?: string } = {};
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("[Chatwoot SSO] Error parsing response", err);
    }

    if (!resp.ok || !data.url) {
      return NextResponse.json(
        { error: "SSO indisponível" },
        { status: resp.status || 500 }
      );
    }

    return NextResponse.json({ url: data.url });
  } catch (err) {
    console.error("[Chatwoot SSO] Error calling Chatwoot API", err);
    return NextResponse.json(
      { error: "SSO indisponível" },
      { status: 500 }
    );
  }
}
