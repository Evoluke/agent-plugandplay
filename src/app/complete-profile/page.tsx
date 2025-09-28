"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabasebrowser } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ArrowLeft, Building2, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import {
  isValidCompanyName,
  isValidCpfCnpj,
  isValidAddress,
  isValidCep,
  isValidResponsible,
  isValidPhone,
} from "@/lib/validators";

export default function CompleteProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [address, setAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("Brasil");
  const [responsible, setResponsible] = useState("");
  const [phone, setPhone] = useState("");
  // const [language, setLanguage] = useState("");
  const [loadingBack, setLoadingBack] = useState(false);

  const handleCpfCnpjChange = (value: string) => {
    let digits = value.replace(/\D/g, "");
    if (digits.length > 14) digits = digits.slice(0, 14);
    if (digits.length <= 11) {
      digits = digits
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else {
      digits = digits
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
    }
    setCpfCnpj(digits);
  };

  const handlePhoneChange = (value: string) => {
    let digits = value.replace(/\D/g, "");
    if (digits.startsWith("55")) digits = digits.slice(2);
    if (digits.length > 11) digits = digits.slice(0, 11);
    digits = digits.replace(/^(\d{2})(\d)/, "($1) $2");
    digits = digits.replace(/(\d{5})(\d)/, "$1-$2");
    setPhone(digits);
  };

  const handleZipChange = (value: string) => {
    let digits = value.replace(/\D/g, "");
    if (digits.length > 8) digits = digits.slice(0, 8);
    if (digits.length > 5) {
      digits = digits.replace(/(\d{5})(\d{1,3})/, "$1-$2");
    }
    setZipCode(digits);
  };

  const handleBack = async () => {
    setLoadingBack(true);
    try {
      await supabasebrowser.auth.signOut();
      router.replace("/login");
    } finally {
      setLoadingBack(false);
    }
  };

  useEffect(() => {
    if (
      process.env.NODE_ENV === "development" &&
      typeof window !== "undefined" &&
      window.location.search.includes("preview=1")
    ) {
      setUserId("preview-user");
      setCompanyName((prev) => prev || "Plug and Play Tecnologia");
      handleCpfCnpjChange(cpfCnpj || "12345678000100");
      setAddress((prev) => prev || "Av. Central, 100");
      handleZipChange(zipCode || "12345000");
      setCity((prev) => prev || "São Paulo");
      setState((prev) => prev || "SP");
      setCountry("Brasil");
      setResponsible((prev) => prev || "Ana Martins");
      handlePhoneChange(phone || "11988887777");
      setLoading(false);
      return;
    }

    supabasebrowser.auth.getUser().then(async ({ data, error }) => {
      if (error || !data?.user) {
        router.replace("/login");
        return;
      }
      const uid = data.user.id;
      setUserId(uid);

      const { data: company, error: companyError } = await supabasebrowser
        .from("company")
        .select("profile_complete, company_profile_id, company_name")
        .eq("user_id", uid)
        .maybeSingle();

      if (companyError) {
        console.error("Erro ao buscar empresa do usuário", companyError.message);
        setLoading(false);
        return;
      }

      if (!company) {
        setLoading(false);
        return;
      }

      if (company.profile_complete) {
        router.replace("/dashboard");
        return;
      }
      setCompanyName(company.company_name || "");

      if (company.company_profile_id) {
        const { data: profile } = await supabasebrowser
          .from("company_profile")
          .select("*")
          .eq("id", company.company_profile_id)
          .single();
        if (profile) {
          handleCpfCnpjChange(profile.cpf_cnpj || "");
          setAddress(profile.address || "");
          handleZipChange(profile.zip_code || "");
          setCity(profile.city || "");
          setState(profile.state || "");
          setCountry(profile.country || "Brasil");
          setResponsible(profile.responsible_name || "");
          handlePhoneChange(profile.phone || "");
          // setLanguage(profile.language || "");
        }
      }
      setLoading(false);
    });
  }, [router, cpfCnpj, phone, zipCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);
    const normalizedCompanyName = companyName.trim();
    if (!isValidCompanyName(normalizedCompanyName)) {
      toast.error("Nome da empresa deve ter entre 4 e 80 caracteres");
      setLoading(false);
      return;
    }
    if (!isValidCpfCnpj(cpfCnpj)) {
      toast.error("CPF/CNPJ inválido");
      setLoading(false);
      return;
    }
    if (!isValidAddress(address)) {
      toast.error("Endereço deve ter entre 3 e 200 caracteres");
      setLoading(false);
      return;
    }
    if (!isValidCep(zipCode)) {
      toast.error("CEP inválido");
      setLoading(false);
      return;
    }
    if (!city || !state) {
      toast.error("Cidade e Estado são obrigatórios");
      setLoading(false);
      return;
    }
    if (!isValidResponsible(responsible)) {
      toast.error("Responsável deve ter entre 4 e 80 caracteres");
      setLoading(false);
      return;
    }
    if (!isValidPhone(phone)) {
      toast.error("Telefone inválido");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/profile/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_name: normalizedCompanyName,
        cpf_cnpj: cpfCnpj,
        address,
        zip_code: zipCode,
        city,
        state,
        country,
        responsible_name: responsible,
        phone,
        // language,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Erro ao salvar");
      setLoading(false);
      return;
    }
    toast.success("Perfil atualizado");
    router.push("/crm");
  };

  if (loading)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#FAFAFA] px-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#2F6F68]" />
        <div className="space-y-1">
          <p className="text-base font-medium text-slate-900">
            Estamos preparando suas informações
          </p>
          <p className="text-sm text-slate-500">
            Em instantes você poderá finalizar o cadastro.
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-start lg:gap-12">
        <aside className="flex flex-col gap-6 lg:w-5/12">
          <Button
            type="button"
            variant="ghost"
            className="self-start rounded-full px-3 text-sm font-medium text-[#2F6F68] hover:bg-[#2F6F68]/5"
            onClick={handleBack}
            disabled={loadingBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
            {loadingBack ? "Voltando..." : "Voltar para login"}
          </Button>

          <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-[0_15px_35px_rgba(47,111,104,0.08)] backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-[#2F6F68]/10 p-2 text-[#2F6F68]">
                <Building2 className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Etapa final
                </p>
                <h1 className="text-2xl font-semibold text-slate-900">
                  Complete o perfil da sua empresa
                </h1>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Centralizamos as informações essenciais para liberar o acesso ao dashboard, ao CRM e às integrações dos seus agentes.
            </p>

            <div className="mt-6 space-y-4 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#2F6F68]" aria-hidden />
                <p>Dados empresariais padronizados para emissão de notas e contratos.</p>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-[#2F6F68]" aria-hidden />
                <p>Armazenamento seguro com verificação automática de CPF/CNPJ e CEP.</p>
              </div>
              <div className="flex items-start gap-3">
                <Loader2 className="mt-0.5 h-4 w-4 animate-spin text-[#97B7B4]" aria-hidden />
                <p>Integração imediata com o CRM assim que você enviar os dados.</p>
              </div>
            </div>
          </div>
        </aside>

        <Card className="flex-1 border-slate-200/80 bg-white/95 shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
          <CardHeader className="gap-4 border-b border-slate-200/70 pb-6">
            <div className="flex flex-col gap-2">
              <CardTitle className="text-xl font-semibold text-slate-900">
                Dados cadastrais
              </CardTitle>
              <CardDescription className="text-sm leading-6 text-slate-600">
                Preencha os dados corporativos para concluir o onboarding da sua conta.
              </CardDescription>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                <span>Progresso</span>
                <span className="text-[#2F6F68]">Etapa única</span>
              </div>
              <Progress value={88} />
            </div>
          </CardHeader>
          <form onSubmit={handleSubmit} className="contents">
            <CardContent className="space-y-8 pt-6">
              <section className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Identificação
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="company" className="text-sm font-medium text-slate-700">
                      Nome da empresa
                    </label>
                    <Input
                      id="company"
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      maxLength={80}
                      required
                      autoComplete="organization"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="cpfCnpj" className="text-sm font-medium text-slate-700">
                      CPF/CNPJ
                    </label>
                    <Input
                      id="cpfCnpj"
                      type="text"
                      value={cpfCnpj}
                      onChange={(e) => handleCpfCnpjChange(e.target.value)}
                      maxLength={18}
                      placeholder="000.000.000-00"
                      required
                      autoComplete="tax-id"
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Endereço
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="address" className="text-sm font-medium text-slate-700">
                      Endereço completo
                    </label>
                    <Input
                      id="address"
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      maxLength={200}
                      required
                      autoComplete="street-address"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="zip" className="text-sm font-medium text-slate-700">
                        CEP
                      </label>
                      <Input
                        id="zip"
                        type="text"
                        value={zipCode}
                        onChange={(e) => handleZipChange(e.target.value)}
                        maxLength={9}
                        placeholder="00000-000"
                        required
                        autoComplete="postal-code"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="city" className="text-sm font-medium text-slate-700">
                        Cidade
                      </label>
                      <Input
                        id="city"
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        maxLength={255}
                        required
                        autoComplete="address-level2"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="state" className="text-sm font-medium text-slate-700">
                        Estado
                      </label>
                      <Input
                        id="state"
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        maxLength={255}
                        required
                        autoComplete="address-level1"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium text-slate-700">
                        Telefone de contato
                      </label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        maxLength={19}
                        placeholder="+55 (11) 90000-0000"
                        required
                        autoComplete="tel"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Responsável
                </h2>
                <div className="space-y-2">
                  <label htmlFor="responsible" className="text-sm font-medium text-slate-700">
                    Nome completo do responsável
                  </label>
                  <Input
                    id="responsible"
                    type="text"
                    value={responsible}
                    onChange={(e) => setResponsible(e.target.value)}
                    maxLength={80}
                    required
                    autoComplete="name"
                  />
                </div>
              </section>
            </CardContent>
            <div className="px-6 pb-6">
              <Button
                type="submit"
                className="w-full justify-center bg-[#2F6F68] text-white hover:bg-[#255852]"
                disabled={loading}
              >
                {loading ? "Salvando informações..." : "Concluir cadastro"}
              </Button>
              <p className="mt-3 text-center text-xs text-slate-500">
                Seus dados são armazenados com segurança seguindo as políticas de privacidade da plataforma.
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
