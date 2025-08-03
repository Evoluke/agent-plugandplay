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
    supabasebrowser.auth.getUser().then(({ data, error }) => {
      if (error) {
        setLoading(false);
        return;
      }
      if (data?.user) router.replace('/dashboard');
      else setLoading(false);
    });
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabasebrowser.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error('Falha no login: ' + error.message);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
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
