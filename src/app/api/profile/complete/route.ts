import { NextResponse } from "next/server";
import { supabaseadmin } from "@/lib/supabaseAdmin";
import {
  isValidCpfCnpj,
  isValidAddress,
  isValidCep,
  isValidResponsible,
  isValidPhone,
} from "@/lib/validators";

export async function POST(req: Request) {
  const {
    user_id,
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
    !user_id ||
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

  if (!isValidCpfCnpj(cpf_cnpj)) {
    return NextResponse.json({ error: "CPF/CNPJ inválido" }, { status: 400 });
  }
  if (!isValidAddress(address)) {
    return NextResponse.json(
      { error: "Endereço deve ter entre 3 e 200 caracteres" },
      { status: 400 },
    );
  }
  if (!isValidCep(zip_code)) {
    return NextResponse.json({ error: "CEP inválido" }, { status: 400 });
  }
  if (!isValidResponsible(responsible_name)) {
    return NextResponse.json(
      { error: "Responsável deve ter entre 4 e 80 caracteres" },
      { status: 400 },
    );
  }
  if (!isValidPhone(phone)) {
    return NextResponse.json({ error: "Telefone inválido" }, { status: 400 });
  }

  const { data: company, error: companyError } = await supabaseadmin
    .from("company")
    .select("id, company_profile_id")
    .eq("user_id", user_id)
    .single();

  if (companyError || !company) {
    return NextResponse.json(
      { error: companyError?.message || "Empresa não encontrada" },
      { status: 404 }
    );
  }

  let profileId = company.company_profile_id as number | null;

  if (profileId) {
    const { error: profileUpdateError } = await supabaseadmin
      .from("company_profile")
      .update({
        cpf_cnpj,
        address,
        zip_code,
        city,
        state,
        country,
        responsible_name,
        phone,
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
        cpf_cnpj,
        address,
        zip_code,
        city,
        state,
        country,
        responsible_name,
        phone,
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
