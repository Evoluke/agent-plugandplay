// src/app/api/support/new/route.ts
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { supabaseadmin } from "@/lib/supabaseAdmin";
import { getUserFromCookie } from "@/lib/auth";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "application/pdf",
]);

const sanitize = (input: string) => input.replace(/<[^>]*>?/gm, "").trim();

const buildPublicUrl = (path: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/ticket-attachments/${path}`;

export async function POST(req: NextRequest) {
  const { user, error: authError } = await getUserFromCookie();
  if (authError || !user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const {
    data: company,
    error: companyError,
  } = await supabaseadmin
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

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch (error) {
    console.error("Erro ao ler dados do formulário:", error);
    return NextResponse.json(
      { error: "Dados de formulário inválidos" },
      { status: 400 }
    );
  }

  const titleEntry = formData.get("title");
  const reasonEntry = formData.get("reason");
  const descriptionEntry = formData.get("description");

  if (typeof titleEntry !== "string" || titleEntry.trim().length < 3) {
    return NextResponse.json(
      { error: "Título é obrigatório e deve ter ao menos 3 caracteres" },
      { status: 400 }
    );
  }

  if (typeof reasonEntry !== "string" || reasonEntry.trim().length < 3) {
    return NextResponse.json(
      { error: "Motivo é obrigatório e deve ter ao menos 3 caracteres" },
      { status: 400 }
    );
  }

  if (
    typeof descriptionEntry !== "string" ||
    descriptionEntry.trim().length < 10
  ) {
    return NextResponse.json(
      { error: "Descrição é obrigatória e deve ter ao menos 10 caracteres" },
      { status: 400 }
    );
  }

  const sanitizedTitle = sanitize(titleEntry);
  const sanitizedReason = sanitize(reasonEntry);
  const sanitizedDescription = sanitize(descriptionEntry);

  if (sanitizedTitle.length < 3) {
    return NextResponse.json(
      { error: "Título é obrigatório e deve ter ao menos 3 caracteres" },
      { status: 400 }
    );
  }

  if (sanitizedReason.length < 3) {
    return NextResponse.json(
      { error: "Motivo é obrigatório e deve ter ao menos 3 caracteres" },
      { status: 400 }
    );
  }

  if (sanitizedDescription.length < 10) {
    return NextResponse.json(
      { error: "Descrição é obrigatória e deve ter ao menos 10 caracteres" },
      { status: 400 }
    );
  }

  const attachmentEntry = formData.get("attachment");
  let attachmentUrl: string | null = null;

  if (attachmentEntry instanceof File && attachmentEntry.size > 0) {
    if (!ALLOWED_MIME_TYPES.has(attachmentEntry.type)) {
      return NextResponse.json(
        { error: "Formato de arquivo não suportado" },
        { status: 400 }
      );
    }

    if (attachmentEntry.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Arquivo muito grande (máx. 5 MB)" },
        { status: 400 }
      );
    }

    const arrayBuffer = await attachmentEntry.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const sanitizedName = (attachmentEntry.name || "anexo")
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .slice(-150);
    const fileName = sanitizedName || `anexo-${Date.now()}`;
    const filePath = `user_ticket/${company.id}/${randomUUID()}-${fileName}`;

    const { data: uploadData, error: uploadError } = await supabaseadmin.storage
      .from("ticket-attachments")
      .upload(filePath, buffer, {
        contentType: attachmentEntry.type || undefined,
        upsert: false,
      });

    if (uploadError || !uploadData?.path) {
      console.error("Erro no upload do arquivo:", uploadError?.message);
      return NextResponse.json(
        { error: "Falha no upload do arquivo" },
        { status: 500 }
      );
    }

    attachmentUrl = buildPublicUrl(uploadData.path);
  } else if (attachmentEntry && !(attachmentEntry instanceof File)) {
    return NextResponse.json(
      { error: "Anexo inválido" },
      { status: 400 }
    );
  }

  const { error: insertError } = await supabaseadmin.from("tickets").insert({
    title: sanitizedTitle,
    reason: sanitizedReason,
    description: sanitizedDescription,
    attachment_url: attachmentUrl,
    company_id: company.id,
  });

  if (insertError) {
    console.error("Erro ao criar ticket:", insertError.message);
    return NextResponse.json(
      { error: "Erro ao criar ticket" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
