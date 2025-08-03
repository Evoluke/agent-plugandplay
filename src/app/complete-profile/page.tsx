"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabasebrowser } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function CompleteProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [responsible, setResponsible] = useState("");
  // const [language, setLanguage] = useState("");

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
          setCpfCnpj(profile.cpf_cnpj || "");
          setAddress(profile.address || "");
          setCity(profile.city || "");
          setState(profile.state || "");
          setCountry(profile.country || "");
          setResponsible(profile.responsible_name || "");
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
    const res = await fetch("/api/profile/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        cpf_cnpj: cpfCnpj,
        address,
        city,
        state,
        country,
        responsible_name: responsible,
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
            onChange={(e) => setCpfCnpj(e.target.value)}
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
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium">
              Cidade
            </label>
            <Input
              id="city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium">
              Estado
            </label>
            <Input
              id="state"
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="country" className="block text-sm font-medium">
              País
            </label>
            <Input
              id="country"
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            />
          </div>
          {/* <div>
            <label htmlFor="language" className="block text-sm font-medium">
              Idioma
            </label>
            <Input
              id="language"
              type="text"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              required
            />
          </div> */}
        </div>
        <div>
          <label htmlFor="responsible" className="block text-sm font-medium">
            Responsável
          </label>
          <Input
            id="responsible"
            type="text"
            value={responsible}
            onChange={(e) => setResponsible(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Salvando..." : "Salvar"}
        </Button>
      </form>
    </div>
  );
}
