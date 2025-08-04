// src/app/api/support/new/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { supabaseadmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const {
    data: company,
    error: companyError,
  } = await supabase
    .from("company")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (companyError || !company) {
    return NextResponse.json(
      { error: companyError?.message || "Empresa não encontrada" },
      { status: 403 }
    );
  }

  const {
    title,
    reason,
    description,
    attachmentPath,
    company_id: requestedCompanyId,
  } = await req.json();

  if (requestedCompanyId && requestedCompanyId !== company.id) {
    return NextResponse.json(
      { error: "Empresa inválida" },
      { status: 403 }
    );
  }

  const attachment_url = attachmentPath
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/ticket-attachments/${attachmentPath}`
    : null;

  const { error } = await supabaseadmin
    .from("tickets")
    .insert([
      {
        title,
        reason,
        description,
        attachment_url,
        company_id: company.id,
      },
    ]);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
