"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabasebrowser } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
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
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [address, setAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("Brasil");
  const [responsible, setResponsible] = useState("");
  const [phone, setPhone] = useState("");
  // const [language, setLanguage] = useState("");

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

  const handleBack = async () => {
    await supabasebrowser.auth.signOut();
    router.replace("/login");
  };

  useEffect(() => {
    supabasebrowser.auth.getUser().then(async ({ data, error }) => {
      if (error || !data?.user) {
        router.replace("/login");
        return;
      }
      const uid = data.user.id;
      setUserId(uid);
      const { data: company } = await supabasebrowser
        .from("company")
        .select("profile_complete, company_profile_id")
        .eq("user_id", uid)
        .single();
      if (company?.profile_complete) {
        router.replace("/dashboard");
        return;
      }
      if (company?.company_profile_id) {
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
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);
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
        user_id: userId,
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
    router.push("/dashboard");
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Carregando...
      </div>
    );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50 p-4">
      <div className="h-full w-full max-w-lg">
        <Button variant="ghost" className="mb-4" onClick={handleBack}>
          ← Voltar
        </Button>

        <form
          onSubmit={handleSubmit}
          className="max-w-md w-full bg-white rounded-lg shadow p-6 space-y-4"
        >

          <h1 className="text-2xl font-semibold text-center">
            Completar Perfil
          </h1>
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
              placeholder="000.000.000-00"
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
                placeholder="00000-000"
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
                placeholder="+00 (00) 00000-0000"
                required
              />
            </div>
            {/* <div>
            <label htmlFor="country" className="block text-sm font-medium">
              País
            </label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o país" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Brasil">Brasil</SelectItem>
                <SelectItem value="Estados Unidos">Estados Unidos</SelectItem>
                <SelectItem value="Portugal">Portugal</SelectItem>
              </SelectContent>
            </Select>
          </div> */}
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
