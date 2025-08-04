'use client';

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { supabasebrowser } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);


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
    const { data, error } = await supabasebrowser.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Falha no login:', error.message);
      toast.error('Falha no login. Tente novamente mais tarde.');
    } else {
      const { data: company } = await supabasebrowser
        .from('company')
        .select('profile_complete')
        .eq('user_id', data.user!.id)
        .single();
      if (company?.profile_complete) router.push('/dashboard');
      else router.push('/complete-profile');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#FAFAFA]">
      <form
        onSubmit={handleSubmit}
        className="max-w-md w-full bg-white rounded-lg shadow p-6 space-y-6"
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
          <Input
            id="password"
            type="password"
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

        <Button type="submit" className="w-full">
          Entrar                                     {/* ← não deixe vazio */}
        </Button>


        <p className="text-center text-sm">
          Não possui conta?{" "}
          <Link href="/signup" className="text-teal-600 hover:underline">
            Cadastrar
          </Link>
        </p>
      </form>
    </div>
  );
}
