import { NextResponse } from "next/server";
import { z } from "zod";

import { supabaseadmin } from "@/lib/supabaseAdmin";

const leadSchema = z.object({
  email: z.string({ required_error: "Informe um e-mail válido." }).email("Informe um e-mail válido."),
  toolSlug: z.string().min(1, "Informe a ferramenta."),
  payload: z.object({
    directCost: z.number().min(0, "Custo direto deve ser positivo."),
    allocatedExpenses: z.number().min(0, "Despesas alocadas devem ser positivas."),
    taxes: z.number().min(0, "Impostos devem ser positivos."),
    desiredMargin: z.number().min(0, "Margem deve ser positiva."),
  }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = leadSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message ?? "Dados inválidos.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { email, toolSlug, payload } = parsed.data;

    const { error } = await supabaseadmin.from("tool_leads").insert({
      email,
      tool_slug: toolSlug,
      payload,
    });

    if (error) {
      console.error("Erro ao salvar lead de ferramenta:", error);
      return NextResponse.json(
        { error: "Não foi possível salvar seus dados agora. Tente novamente em instantes." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro inesperado ao registrar lead de ferramenta:", error);
    return NextResponse.json(
      { error: "Não foi possível processar sua solicitação." },
      { status: 500 },
    );
  }
}
