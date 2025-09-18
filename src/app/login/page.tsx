'use client';

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { supabasebrowser } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);


  useEffect(() => {
    supabasebrowser.auth.getUser().then(async ({ data, error }) => {
      if (error) {
        setLoading(false);
        return;
      }

      const user = data?.user;
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: company, error: companyError } = await supabasebrowser
        .from('company')
        .select('profile_complete')
        .eq('user_id', user.id)
        .maybeSingle();

      if (companyError) {
        console.error('Erro ao buscar empresa do usuário', companyError.message);
        setLoading(false);
        return;
      }

      if (company?.profile_complete) router.replace('/dashboard');
      else router.replace('/complete-profile');
    });
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { data, error } = await supabasebrowser.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('Falha no login:', error.message);
        if (error.message.includes('Email not confirmed')) {
          router.push('/verify-email?email=' + encodeURIComponent(email));
        } else if (error.message.includes('Invalid login credentials')) {
          toast.error('Email ou senha inválidos');
        } else {
          toast.error('Falha no login. Tente novamente mais tarde.');
        }
      } else {
        const { data: company } = await supabasebrowser
          .from('company')
          .select('profile_complete')
          .eq('user_id', data.user!.id)
          .single();
        if (company?.profile_complete) router.push('/dashboard');
        else router.push('/complete-profile');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const redirectTo = new URL('/login', baseUrl).toString();
      const { error } = await supabasebrowser.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });
      if (error) {
        console.error('Erro ao entrar com Google:', error.message);
        toast.error('Não foi possível conectar com o Google. Tente novamente.');
      }
    } catch (err) {
      console.error('Erro inesperado ao entrar com Google:', err);
      toast.error('Não foi possível conectar com o Google. Tente novamente.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#FAFAFA]">
      <div className="w-full px-4 sm:max-w-md md:max-w-lg">
        <Image
          src="/logo.png"
          alt="Evoluke logo"
          width={200}
          height={60}
          className="mb-8 mx-auto"
        />
        <form
          onSubmit={handleSubmit}
          className="w-full bg-white rounded-lg shadow p-6 space-y-6"
        >
        <h1 className="text-2xl font-semibold text-center">Login</h1>

        <div className="space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full justify-center gap-3 border-[#DADCE0] bg-white text-[#3C4043] shadow-sm hover:bg-[#F8F9FA] hover:text-[#202124] focus-visible:ring-[#4285F4]/50 focus-visible:ring-offset-2"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              viewBox="0 0 24 24"
            >
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
              {isGoogleLoading ? 'Redirecionando...' : 'Entrar com Google'}
            </span>
          </Button>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="h-px flex-1 bg-gray-200" />
            <span>ou continue com e-mail</span>
            <span className="h-px flex-1 bg-gray-200" />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium">Email</label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium">Senha</label>
          <PasswordInput
            id="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="text-right -mt-5">
          <Link href="/forgot-password" className="text-sm text-teal-600 hover:underline">
            Esqueci minha senha
          </Link>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Entrando..." : "Entrar"}                                     {/* ← não deixe vazio */}
        </Button>


        <p className="text-center text-sm">
          Não possui conta?{" "}
          <Link href="/signup" className="text-teal-600 hover:underline">
            Cadastrar
          </Link>
        </p>
      </form>
    </div>
  </div>
  );
}
