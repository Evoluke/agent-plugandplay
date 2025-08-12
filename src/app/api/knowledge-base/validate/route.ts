export const runtime = "nodejs";

import { NextResponse } from "next/server";
import {
  ALLOWED_KNOWLEDGE_MIME_TYPES,
  MAX_KNOWLEDGE_FILE_SIZE,
} from "@/lib/constants";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 });
  }

  if (!ALLOWED_KNOWLEDGE_MIME_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Tipo de arquivo não suportado" },
      { status: 400 },
    );
  }

  if (file.size > MAX_KNOWLEDGE_FILE_SIZE) {
    return NextResponse.json(
      { error: "Arquivo excede o tamanho máximo de 10MB" },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}

