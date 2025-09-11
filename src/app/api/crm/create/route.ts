import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";
import { supabaseadmin } from "@/lib/supabaseAdmin";

export async function POST() {
  const { user } = await getUserFromCookie();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { data: company, error } = await supabaseadmin
    .from("company")
    .select("id, chatwoot_id")
    .eq("user_id", user.id)
    .single();

  if (error || !company) {
    return NextResponse.json(
      { error: error?.message || "Empresa não encontrada" },
      { status: 404 }
    );
  }

  if (company.chatwoot_id) {
    return NextResponse.json({ message: "CRM já criado" });
  }

  const webhookUrl = process.env.N8N_CRM_WEBHOOK_URL;
  const webhookToken = process.env.N8N_WEBHOOK_TOKEN;

  if (!webhookUrl || !webhookToken) {
    return NextResponse.json(
      { error: "Webhook não configurado" },
      { status: 500 }
    );
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${webhookToken}`,
    },
    body: JSON.stringify({ email: user.email, company_id: company.id }),
  });

  const data = (await response.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;

  if (!response.ok) {
    const errorMessage =
      typeof data.error === "string" ? data.error : "Falha ao criar CRM";
    return NextResponse.json(
      { error: errorMessage },
      { status: response.status }
    );
  }

  return NextResponse.json(data);
}
