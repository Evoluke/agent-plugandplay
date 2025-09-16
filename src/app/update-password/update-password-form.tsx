'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PasswordInput } from '@/components/ui/password-input';
import { Button } from '@/components/ui/button';
import { supabasebrowser } from '@/lib/supabaseClient';
import { toast } from 'sonner';

export default function UpdatePasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const combinedParams = useMemo(() => {
    const params = new URLSearchParams(searchParamsString);

    if (typeof window !== 'undefined' && window.location.hash) {
      const hashString = window.location.hash.startsWith('#')
        ? window.location.hash.slice(1)
        : window.location.hash;

      if (hashString) {
        const hashParams = new URLSearchParams(hashString);
        hashParams.forEach((value, key) => {
          params.set(key, value);
        });
      }
    }

    return params;
  }, [searchParamsString]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.location.hash) {
      return;
    }

    const urlWithoutHash = `${window.location.pathname}${window.location.search}`;
    window.history.replaceState(window.history.state, '', urlWithoutHash);
  }, []);

  const errorDescription =
    combinedParams.get('error_description') || combinedParams.get('error');

  const parseNumericParam = (value: string | null) => {
    if (value === null) return undefined;
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : undefined;
  };

  const expiresAtSeconds = parseNumericParam(combinedParams.get('expires_at'));
  const expiresInSeconds = parseNumericParam(combinedParams.get('expires_in'));

  const expirationTimestamp =
    expiresAtSeconds !== undefined
      ? expiresAtSeconds * 1000
      : expiresInSeconds !== undefined
      ? Date.now() + expiresInSeconds * 1000
      : undefined;

  const isExpired =
    typeof expirationTimestamp === 'number'
      ? Date.now() > expirationTimestamp
      : false;
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!strong.test(password)) {
      toast.error(
        'A senha deve ter pelo menos 8 caracteres e incluir letras maiúsculas, minúsculas e números'
      );
      return;
    }
    if (password !== confirm) {
      toast.error('As senhas não coincidem');
      return;
    }
    setLoading(true);
    const { error } = await supabasebrowser.auth.updateUser({ password });
    if (error) {
      console.error('Erro ao redefinir senha:', error.message);
      toast.error('Erro ao redefinir senha. Tente novamente mais tarde.');
    } else {
      await supabasebrowser.auth.signOut();
      toast.success('Senha atualizada');
      router.push('/login');
    }
    setLoading(false);
  };

  if (errorDescription || isExpired) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#FAFAFA]">
        <div className="w-full px-4 sm:max-w-md md:max-w-lg">
          <div className="w-full bg-white rounded-lg shadow p-6 space-y-4 text-center">
            <p className="text-lg font-medium">
              {errorDescription || 'O link de recuperação expirou.'}
            </p>
            <Button onClick={() => router.push('/login')} className="w-full">
              Voltar ao login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#FAFAFA]">
      <div className="w-full px-4 sm:max-w-md md:max-w-lg">
        <form
          onSubmit={handleSubmit}
          className="w-full bg-white rounded-lg shadow p-6 space-y-4"
        >
          <h1 className="text-2xl font-semibold text-center">Nova senha</h1>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Senha
            </label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <div>
            <label htmlFor="confirm" className="block text-sm font-medium">
              Confirmar senha
            </label>
            <PasswordInput
              id="confirm"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </form>
      </div>
    </div>
  );
}

