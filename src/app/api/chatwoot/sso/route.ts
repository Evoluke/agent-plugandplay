import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";
import { supabaseadmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function GET() {
  console.log("[Chatwoot SSO] Request received");
  const { user } = await getUserFromCookie().catch((err) => {
    console.error("[Chatwoot SSO] Error fetching user", err);
    return { user: null };
  });
  if (!user) {
    console.warn("[Chatwoot SSO] No authenticated user");
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  console.log("[Chatwoot SSO] User", user.id);

  const { data: company, error } = await supabaseadmin
    .from("company")
    .select("chatwoot_id")
    .eq("user_id", user.id)
    .single();

  if (error || !company?.chatwoot_id) {
    console.warn("[Chatwoot SSO] Chatwoot ID not found", { error, userId: user.id });
    return NextResponse.json(
      { error: "Chatwoot ID não encontrado" },
      { status: 404 }
    );
  }

  console.log("[Chatwoot SSO] Chatwoot ID", company.chatwoot_id);

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
      `${baseUrl}/platform/api/v1/users/${company.chatwoot_id}/login`,
      {
        headers: {
          Authorization: `ApiKey ${token}`,
        },
      }
    );

    const text = await resp.text();
    console.log("[Chatwoot SSO] Chatwoot response", resp.status, text);
    let data: { url?: string } = {};
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("[Chatwoot SSO] Error parsing response", err);
    }

    if (!resp.ok || !data.url) {
      console.warn("[Chatwoot SSO] Invalid response from Chatwoot", resp.status);
      return NextResponse.json(
        { error: "SSO indisponível" },
        { status: resp.status || 500 }
      );
    }

    console.log("[Chatwoot SSO] SSO link generated");
    return NextResponse.json({ url: data.url });
  } catch (err) {
    console.error("[Chatwoot SSO] Error calling Chatwoot API", err);
    return NextResponse.json(
      { error: "SSO indisponível" },
      { status: 500 }
    );
  }
}
