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
  const [oauthProviderLoading, setOauthProviderLoading] = useState<
    "google" | "linkedin" | null
  >(null);

  useEffect(() => {
    supabasebrowser.auth.getUser().then(async ({ data, error }) => {
      if (error) {
        setLoading(false);
        return;
      }
      if (data?.user) {
        const { data: company } = await supabasebrowser
          .from('company')
          .select('profile_complete')
          .eq('user_id', data.user.id)
          .single();
        if (company?.profile_complete) router.replace('/dashboard');
        else router.replace('/complete-profile');
      } else setLoading(false);
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

  const handleOAuthLogin = async (provider: "google" | "linkedin") => {
    try {
      setOauthProviderLoading(provider);
      const { error } = await supabasebrowser.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
      });

      if (error) {
        console.error(`Falha no login ${provider}:`, error.message);
        toast.error("Não foi possível iniciar o login social.");
      }
    } catch (err) {
      console.error(`Erro inesperado no login ${provider}:`, err);
      toast.error("Não foi possível iniciar o login social.");
    } finally {
      setOauthProviderLoading(null);
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


        <div className="space-y-3">
          <div className="flex items-center gap-3 text-xs uppercase text-gray-500">
            <span className="h-px flex-1 bg-gray-200" />
            <span>ou</span>
            <span className="h-px flex-1 bg-gray-200" />
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => handleOAuthLogin("google")}
            disabled={
              isSubmitting || oauthProviderLoading !== null
            }
          >
            {oauthProviderLoading === "google" ? "Redirecionando..." : "Entrar com Google"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => handleOAuthLogin("linkedin")}
            disabled={
              isSubmitting || oauthProviderLoading !== null
            }
          >
            {oauthProviderLoading === "linkedin" ? "Redirecionando..." : "Entrar com LinkedIn"}
          </Button>
        </div>


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
