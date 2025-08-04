"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabasebrowser } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
  isValidCompanyName,
  isValidEmail,
  isValidPassword,
  isValidCpfCnpj,
  isValidAddress,
  isValidCep,
  isValidResponsible,
  isValidPhone,
} from "@/lib/validators";

export default function ConfigPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [initialEmail, setInitialEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [address, setAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("Brasil");
  const [responsible, setResponsible] = useState("");
  const [phone, setPhone] = useState("");

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
    if (digits.length > 13) digits = digits.slice(0, 13);
    let formatted = "";
    if (digits.length > 0) formatted += "+" + digits.slice(0, 2);
    if (digits.length >= 3) formatted += " (" + digits.slice(2, 4) + ")";
    if (digits.length >= 5) formatted += " " + digits.slice(4, 9);
    if (digits.length >= 10) formatted += "-" + digits.slice(9, 13);
    setPhone(formatted);
  };

  const handleZipChange = (value: string) => {
    let digits = value.replace(/\D/g, "");
    if (digits.length > 8) digits = digits.slice(0, 8);
    if (digits.length > 5) {
      digits = digits.replace(/(\d{5})(\d{1,3})/, "$1-$2");
    }
    setZipCode(digits);
  };

  useEffect(() => {
    supabasebrowser.auth.getUser().then(async ({ data, error }) => {
      if (error || !data?.user) {
        router.replace("/login");
        return;
      }
      const uid = data.user.id;
      setUserId(uid);
      const userEmail = data.user.email || "";
      setEmail(userEmail);
      setInitialEmail(userEmail);
      const { data: company } = await supabasebrowser
        .from("company")
        .select("company_name, company_profile_id")
        .eq("user_id", uid)
        .single();
      if (company) {
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
          }
        }
      }
      setLoading(false);
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);

    if (!isValidCompanyName(companyName)) {
      toast.error("Nome da empresa deve ter entre 4 e 80 caracteres");
      setSaving(false);
      return;
    }
    if (!isValidEmail(email)) {
      toast.error("Email inválido");
      setSaving(false);
      return;
    }
    if (password) {
      if (!isValidPassword(password)) {
        toast.error(
          "Senha deve ter ao menos 8 caracteres com maiúsculas, minúsculas, número e símbolo",
        );
        setSaving(false);
        return;
      }
      if (password !== confirm) {
        toast.error("As senhas não coincidem");
        setSaving(false);
        return;
      }
    }
    if (!isValidCpfCnpj(cpfCnpj)) {
      toast.error("CPF/CNPJ inválido");
      setSaving(false);
      return;
    }
    if (!isValidAddress(address)) {
      toast.error("Endereço deve ter entre 3 e 200 caracteres");
      setSaving(false);
      return;
    }
    if (!isValidCep(zipCode)) {
      toast.error("CEP inválido");
      setSaving(false);
      return;
    }
    if (!isValidResponsible(responsible)) {
      toast.error("Responsável deve ter entre 4 e 80 caracteres");
      setSaving(false);
      return;
    }
    if (!isValidPhone(phone)) {
      toast.error("Telefone inválido");
      setSaving(false);
      return;
    }

    const emailChanged = email !== initialEmail;
    const { error: authError } = await supabasebrowser.auth.updateUser({
      email,
      password: password || undefined,
      data: { name: companyName },
    });
    if (authError) {
      toast.error(authError.message);
      setSaving(false);
      return;
    }

    const { error: companyError } = await supabasebrowser
      .from("company")
      .update({ company_name: companyName })
      .eq("user_id", userId);
    if (companyError) {
      toast.error(companyError.message);
      setSaving(false);
      return;
    }

    const res = await fetch("/api/profile/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cpf_cnpj: cpfCnpj,
        address,
        zip_code: zipCode,
        city,
        state,
        country,
        responsible_name: responsible,
        phone,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Erro ao salvar perfil");
      setSaving(false);
      return;
    }

    if (emailChanged) {
      toast.info("Verifique seu novo e-mail para confirmar a alteração");
    }
    toast.success("Configurações salvas");
    setInitialEmail(email);
    setPassword("");
    setConfirm("");
    setSaving(false);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        Carregando...
      </div>
    );

  return (
    <div className=" bg-gray-50 flex items-center justify-center p-6">
      {/* <div className="h-full w-full max-w-lg"> */}
      <div className="h-full w-full max-w-lg">
        <Card className="border shadow-lg rounded-lg overflow-hidden">
          <CardHeader className="bg-white px-6 py-4 border-b">
            <CardTitle className="text-xl font-semibold text-gray-800 text-center">Configurações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="company" className="block text-sm font-medium">
                  Nome da empresa
                </label>
                <Input
                  id="company"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium">
                  Nova senha
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="confirm" className="block text-sm font-medium">
                  Confirmar senha
                </label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="cpfCnpj" className="block text-sm font-medium">
                  CPF/CNPJ
                </label>
                <Input
                  id="cpfCnpj"
                  type="text"
                  value={cpfCnpj}
                  onChange={(e) => handleCpfCnpjChange(e.target.value)}
                  maxLength={18}
                  required
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium">
                  Endereço
                </label>
                <Input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  maxLength={200}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="zip" className="block text-sm font-medium">
                    CEP
                  </label>
                  <Input
                    id="zip"
                    type="text"
                    value={zipCode}
                    onChange={(e) => handleZipChange(e.target.value)}
                    maxLength={9}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium">
                    Cidade
                  </label>
                  <Input
                    id="city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    maxLength={255}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="state" className="block text-sm font-medium">
                    Estado
                  </label>
                  <Input
                    id="state"
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    maxLength={255}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium">
                    Telefone
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    maxLength={19}
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="responsible" className="block text-sm font-medium">
                  Nome do responsável
                </label>
                <Input
                  id="responsible"
                  type="text"
                  value={responsible}
                  onChange={(e) => setResponsible(e.target.value)}
                  maxLength={80}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}