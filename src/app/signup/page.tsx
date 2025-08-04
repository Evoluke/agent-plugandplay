"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  isValidCompanyName,
  isValidEmail,
  isValidPassword,
} from "@/lib/validators";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isValidCompanyName(name)) {
      setError("Nome da empresa deve ter entre 4 e 80 caracteres");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Email inválido");
      return;
    }
    if (!isValidPassword(password)) {
      setError(
        "Senha deve ter ao menos 8 caracteres com maiúsculas, minúsculas, número e símbolo",
      );
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Falha no cadastro");
      } else {
        toast.success("Verifique seu email para confirmar o cadastro");
        router.push("/login");
      }
    } catch {
      toast.error("Erro de conexão");
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#FAFAFA] p-4">
      <form
        onSubmit={handleSubmit}
        className="max-w-md w-full bg-white rounded-lg shadow p-6 space-y-4"
      >
        <h1 className="text-2xl font-semibold text-center">Cadastro</h1>

        {error && (
          <div className="text-red-600 text-sm text-center">{error}</div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Nome da empresa
          </label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            Senha
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="confirm" className="block text-sm font-medium">
            Confirme a senha
          </label>
          <Input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Cadastrando..." : "Cadastrar"}
        </Button>

        <p className="text-center text-sm">
          Já tem conta?{" "}
          <Link href="/login" className="text-teal-600 hover:underline">
            Fazer login
          </Link>
        </p>
      </form>
    </div>
  );
}
