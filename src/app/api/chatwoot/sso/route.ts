import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";
import { supabaseadmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function GET() {
  const { user } = await getUserFromCookie().catch((err) => {
    console.error("[Chatwoot SSO] Error fetching user", err);
    return { user: null };
  });
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { data: company, error } = await supabaseadmin
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

    const contentType = resp.headers.get("content-type") ?? "";
    const rawBody = await resp.text();
    let data: { url?: string } | null = null;

    if (contentType.includes("application/json")) {
      try {
        data = JSON.parse(rawBody);
      } catch (err) {
        console.error("[Chatwoot SSO] Error parsing JSON response", err);
      }
    } else {
      console.error("[Chatwoot SSO] Unexpected content-type", {
        contentType,
        snippet: rawBody.slice(0, 200),
      });
    }

    if (!resp.ok || !data?.url) {
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
