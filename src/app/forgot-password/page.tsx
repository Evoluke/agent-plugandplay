'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabasebrowser } from '@/lib/supabaseClient';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabasebrowser.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    if (error) {
      console.error('Erro ao enviar email:', error.message);
      toast.error('Erro ao enviar email. Tente novamente mais tarde.');
    } else {
      toast.success('Email de recuperação enviado');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#FAFAFA] p-4">
      <Image
        src="/logo.svg"
        alt="Evoluke logo"
        width={200}
        height={60}
        className="mb-8"
      />
      <form
        onSubmit={handleSubmit}
        className="max-w-md w-full bg-white rounded-lg shadow p-6 space-y-4"
      >
        <h1 className="text-2xl font-semibold text-center">Recuperar senha</h1>

        <div>
          <label htmlFor="email" className="block text-sm font-medium">Email</label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar link'}
        </Button>

        <p className="text-center text-sm">
          Lembrou a senha?{' '}
          <Link href="/login" className="text-teal-600 hover:underline">
            Voltar ao login
          </Link>
        </p>
      </form>
    </div>
  );
}

