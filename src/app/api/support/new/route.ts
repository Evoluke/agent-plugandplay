// src/app/api/support/new/route.ts
import { NextResponse } from "next/server";
import { supabaseadmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  const { title, reason, description, attachmentPath, company_id } = await req.json();

  // monta a URL pública do anexo, se houver
  const attachment_url = attachmentPath
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/ticket-attachments/${attachmentPath}`
    : null;

  // faz o insert usando service role (ignora RLS)
  const { error } = await supabaseadmin
    .from("tickets")
    .insert([
      {
        title,
        reason,
        description,
        attachment_url,
        company_id: company_id,
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
