import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";
import { supabaseadmin } from "@/lib/supabaseAdmin";
import {
  isValidCompanyName,
  isValidEmail,
  isValidPassword,
} from "@/lib/validators";

type ErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

type SuccessResponse = {
  success: true;
  emailChanged: boolean;
};

function createErrorResponse(code: string, message: string, status = 400) {
  return NextResponse.json<ErrorResponse>(
    { success: false, error: { code, message } },
    { status },
  );
}

export async function POST(req: Request) {
  try {
    const { user } = await getUserFromCookie();
    if (!user) {
      return createErrorResponse("AUTH_NOT_AUTHENTICATED", "Não autenticado", 401);
    }

    let payload: unknown;
    try {
      payload = await req.json();
    } catch {
      return createErrorResponse("INVALID_BODY", "JSON inválido", 400);
    }

    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return createErrorResponse("INVALID_BODY", "Dados inválidos", 400);
    }

    const { companyName, email, password } = payload as {
      companyName?: unknown;
      email?: unknown;
      password?: unknown;
    };

    if (typeof companyName !== "string" || !companyName.trim()) {
      return createErrorResponse(
        "INVALID_COMPANY_NAME",
        "Nome da empresa é obrigatório",
        400,
      );
    }

    if (!isValidCompanyName(companyName)) {
      return createErrorResponse(
        "INVALID_COMPANY_NAME",
        "Nome da empresa deve ter entre 4 e 80 caracteres",
        400,
      );
    }

    if (typeof email !== "string" || !email.trim()) {
      return createErrorResponse("INVALID_EMAIL", "Email é obrigatório", 400);
    }

    if (!isValidEmail(email)) {
      return createErrorResponse("INVALID_EMAIL", "Email inválido", 400);
    }

    let sanitizedPassword: string | undefined;
    if (password !== undefined && password !== null && `${password}`.length > 0) {
      if (typeof password !== "string") {
        return createErrorResponse("INVALID_PASSWORD", "Senha inválida", 400);
      }

      if (!isValidPassword(password)) {
        return createErrorResponse(
          "INVALID_PASSWORD",
          "Senha deve ter ao menos 8 caracteres com maiúsculas, minúsculas, número e símbolo",
          400,
        );
      }

      sanitizedPassword = password;
    }

    const normalizedCompanyName = companyName.trim();
    const normalizedEmail = email.trim();
    const userId = user.id;

    const { data: company, error: companyError } = await supabaseadmin
      .from("company")
      .select("id, user_id")
      .eq("user_id", userId)
      .single();

    if (companyError && companyError.code !== "PGRST116") {
      return createErrorResponse(
        "COMPANY_FETCH_FAILED",
        companyError.message || "Erro ao buscar empresa",
        500,
      );
    }

    if (!company) {
      return createErrorResponse("COMPANY_NOT_FOUND", "Empresa não encontrada", 404);
    }

    if (company.user_id !== userId) {
      return createErrorResponse(
        "COMPANY_FORBIDDEN",
        "Empresa não pertence ao usuário",
        403,
      );
    }

    const existingMetadata =
      typeof user.user_metadata === "object" && user.user_metadata !== null
        ? (user.user_metadata as Record<string, unknown>)
        : {};

    const updatePayload: {
      email: string;
      password?: string;
      user_metadata: Record<string, unknown>;
      email_confirm?: boolean;
    } = {
      email: normalizedEmail,
      user_metadata: { ...existingMetadata, name: normalizedCompanyName },
    };

    if (sanitizedPassword) {
      updatePayload.password = sanitizedPassword;
    }

    if (normalizedEmail !== user.email) {
      updatePayload.email_confirm = false;
    }

    const { error: authError } = await supabaseadmin.auth.admin.updateUserById(
      userId,
      updatePayload,
    );

    if (authError) {
      return createErrorResponse(
        "AUTH_UPDATE_FAILED",
        authError.message || "Erro ao atualizar usuário",
        400,
      );
    }

    const { error: companyUpdateError } = await supabaseadmin
      .from("company")
      .update({ company_name: normalizedCompanyName })
      .eq("id", company.id);

    if (companyUpdateError) {
      return createErrorResponse(
        "COMPANY_UPDATE_FAILED",
        companyUpdateError.message || "Erro ao atualizar empresa",
        500,
      );
    }

    return NextResponse.json<SuccessResponse>({
      success: true,
      emailChanged: normalizedEmail !== user.email,
    });
  } catch (error) {
    console.error("profile/update error", error);
    return createErrorResponse(
      "INTERNAL_SERVER_ERROR",
      "Erro interno do servidor",
      500,
    );
  }
}
