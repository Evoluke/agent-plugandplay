import { NextResponse } from "next/server";
import { supabaseadmin } from "@/lib/supabaseAdmin";
import { getUserFromCookie } from "@/lib/auth";
import {
  isValidCpfCnpj,
  isValidAddress,
  isValidCep,
  isValidResponsible,
  isValidPhone,
} from "@/lib/validators";

export async function POST(req: Request) {
  const { user } = await getUserFromCookie();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const {
    cpf_cnpj,
    address,
    zip_code,
    city,
    state,
    country,
    responsible_name,
    phone,
    // language,
  } = await req.json();

  if (
    !cpf_cnpj ||
    !address ||
    !zip_code ||
    !city ||
    !state ||
    !country ||
    !responsible_name ||
    !phone
    // !language
  ) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  }

  const cleanCpfCnpj = cpf_cnpj.replace(/\D/g, "");
  const cleanZip = zip_code.replace(/\D/g, "");
  const cleanPhone = phone.replace(/\D/g, "").replace(/^55/, "");

  if (!isValidCpfCnpj(cleanCpfCnpj)) {
    return NextResponse.json({ error: "CPF/CNPJ inválido" }, { status: 400 });
  }
  if (!isValidAddress(address)) {
    return NextResponse.json(
      { error: "Endereço deve ter entre 3 e 200 caracteres" },
      { status: 400 },
    );
  }
  if (!isValidCep(cleanZip)) {
    return NextResponse.json({ error: "CEP inválido" }, { status: 400 });
  }
  if (!isValidResponsible(responsible_name)) {
    return NextResponse.json(
      { error: "Responsável deve ter entre 4 e 80 caracteres" },
      { status: 400 },
    );
  }
  if (!isValidPhone(cleanPhone)) {
    return NextResponse.json({ error: "Telefone inválido" }, { status: 400 });
  }

  const user_id = user.id;
  const { data: company, error: companyError } = await supabaseadmin
    .from("company")
    .select("id, company_profile_id, user_id")
    .eq("user_id", user_id)
    .maybeSingle();

  if (companyError) {
    return NextResponse.json(
      { error: companyError.message },
      { status: 500 }
    );
  }

  let companyRecord = company;

  if (!companyRecord) {
    const { data: newCompany, error: createCompanyError } = await supabaseadmin
      .from("company")
      .insert({ user_id, profile_complete: false })
      .select("id, company_profile_id, user_id")
      .single();

    if (createCompanyError) {
      if (createCompanyError.code === "23505") {
        const { data: existingCompany, error: fetchExistingError } =
          await supabaseadmin
            .from("company")
            .select("id, company_profile_id, user_id")
            .eq("user_id", user_id)
            .single();

        if (fetchExistingError || !existingCompany) {
          return NextResponse.json(
            { error: fetchExistingError?.message || "Empresa não encontrada" },
            { status: 404 }
          );
        }

        companyRecord = existingCompany;
      } else {
        return NextResponse.json(
          { error: createCompanyError.message },
          { status: 500 }
        );
      }
    } else {
      companyRecord = newCompany;
    }
  }

  if (!companyRecord) {
    return NextResponse.json(
      { error: "Empresa não encontrada" },
      { status: 404 }
    );
  }

  if (companyRecord.user_id !== user_id) {
    return NextResponse.json(
      { error: "Empresa não pertence ao usuário" },
      { status: 403 }
    );
  }

  let profileId = companyRecord.company_profile_id as number | null;

  if (profileId) {
    const { error: profileUpdateError } = await supabaseadmin
      .from("company_profile")
      .update({
        cpf_cnpj: cleanCpfCnpj,
        address,
        zip_code: cleanZip,
        city,
        state,
        country,
        responsible_name,
        phone: cleanPhone,
        // language,
      })
      .eq("id", profileId);

    if (profileUpdateError) {
      return NextResponse.json(
        { error: profileUpdateError.message },
        { status: 500 }
      );
    }
  } else {
    const { data: profile, error: profileInsertError } = await supabaseadmin
      .from("company_profile")
      .insert({
        cpf_cnpj: cleanCpfCnpj,
        address,
        zip_code: cleanZip,
        city,
        state,
        country,
        responsible_name,
        phone: cleanPhone,
        // language,
      })
      .select("id")
      .single();

    if (profileInsertError) {
      return NextResponse.json(
        { error: profileInsertError.message },
        { status: 500 }
      );
    }

    profileId = profile.id;
  }

  const { error: updateCompanyError } = await supabaseadmin
    .from("company")
    .update({ company_profile_id: profileId, profile_complete: true })
    .eq("user_id", user_id);

  if (updateCompanyError) {
    return NextResponse.json({ error: updateCompanyError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
