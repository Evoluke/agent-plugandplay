"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  isValidCompanyName,
  isValidEmail,
  isValidPassword,
} from "@/lib/validators";
import { supabasebrowser } from "@/lib/supabaseClient";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const redirectTo = new URL("/login", baseUrl).toString();
      const { error } = await supabasebrowser.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (error) {
        console.error("Erro ao entrar com Google:", error.message);
        toast.error("Não foi possível conectar com o Google. Tente novamente.");
      }
    } catch (err) {
      console.error("Erro inesperado ao entrar com Google:", err);
      toast.error("Não foi possível conectar com o Google. Tente novamente.");
    } finally {
      setGoogleLoading(false);
    }
  };

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
    <div className="fixed inset-0 flex items-center justify-center bg-[#FAFAFA]">
      <div className="w-full px-4 sm:max-w-md md:max-w-lg">
        <form
          onSubmit={handleSubmit}
          className="w-full bg-white rounded-lg shadow p-6 space-y-4"
        >
        <h1 className="text-2xl font-semibold text-center">Cadastro</h1>

        <div className="space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full justify-center gap-3 border-[#DADCE0] bg-white text-[#3C4043] shadow-sm hover:bg-[#F8F9FA] hover:text-[#202124] focus-visible:ring-[#4285F4]/50 focus-visible:ring-offset-2"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
          >
            <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.1 5.1 0 0 1-2.19 3.34v2.77h3.54c2.07-1.91 3.29-4.72 3.29-8.12Z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.54-2.77c-.98.66-2.23 1.06-3.74 1.06-2.88 0-5.32-1.94-6.2-4.56H2.11v2.87C3.93 20.53 7.68 23 12 23Z"
              />
              <path
                fill="#FBBC05"
                d="M5.8 14.06c-.22-.66-.35-1.36-.35-2.06s.13-1.4.35-2.06V7.07H2.11C1.4 8.58 1 10.24 1 12s.4 3.42 1.11 4.93l3.69-2.87Z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.07.56 4.21 1.66l3.16-3.16C17.46 1.73 14.97.5 12 .5 7.68.5 3.93 3.47 2.11 7.07l3.69 2.87c.88-2.62 3.32-4.56 6.2-4.56Z"
              />
            </svg>
            <span className="font-medium">
              {googleLoading ? "Redirecionando..." : "Continuar com Google"}
            </span>
          </Button>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="h-px flex-1 bg-gray-200" />
            <span>ou crie sua conta com e-mail</span>
            <span className="h-px flex-1 bg-gray-200" />
          </div>
        </div>

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
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="confirm" className="block text-sm font-medium">
            Confirme a senha
          </label>
          <PasswordInput
            id="confirm"
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
  </div>
  );
}
