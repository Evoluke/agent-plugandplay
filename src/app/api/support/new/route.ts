// src/app/api/support/new/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { supabaseadmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
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

  if (!title || typeof title !== "string" || title.trim().length < 3) {
    return NextResponse.json(
      { error: "Título é obrigatório e deve ter ao menos 3 caracteres" },
      { status: 400 }
    );
  }

  if (!reason || typeof reason !== "string" || reason.trim().length < 3) {
    return NextResponse.json(
      { error: "Motivo é obrigatório e deve ter ao menos 3 caracteres" },
      { status: 400 }
    );
  }

  if (!description || typeof description !== "string" || description.trim().length < 10) {
    return NextResponse.json(
      { error: "Descrição é obrigatória e deve ter ao menos 10 caracteres" },
      { status: 400 }
    );
  }

  const sanitize = (input: string) => input.replace(/<[^>]*>?/gm, "").trim();

  const sanitizedTitle = sanitize(title);
  const sanitizedReason = sanitize(reason);
  const sanitizedDescription = sanitize(description);

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
        title: sanitizedTitle,
        reason: sanitizedReason,
        description: sanitizedDescription,
        attachment_url,
        company_id: company.id,
      },
    ]);

  if (error) {
    console.error('Erro ao criar ticket:', error.message);
    return NextResponse.json(
      { error: 'Erro ao criar ticket' },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
