'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabasebrowser } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const router = useRouter();
  const cooldownDuration = 60;
  const cooldownKey = email ? `verify-email-cooldown:${email}` : null;
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState<
    'checking' | 'unconfirmed' | 'confirmed' | 'not_found' | 'invalid' | 'error'
  >('checking');

  useEffect(() => {
    if (!email) {
      setEmailStatus('invalid');
      return;
    }

    let active = true;

    const checkStatus = async () => {
      setEmailStatus('checking');
      try {
        const response = await fetch('/api/auth/email-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        if (!active) return;

        if (response.ok) {
          const payload: { status?: string } = await response.json();
          if (!active) return;

          if (payload.status === 'unconfirmed') {
            setEmailStatus('unconfirmed');
          } else if (payload.status === 'confirmed') {
            setEmailStatus('confirmed');
          } else {
            setEmailStatus('not_found');
          }
        } else if (response.status === 400) {
          setEmailStatus('invalid');
        } else {
          setEmailStatus('error');
        }
      } catch (err) {
        console.error('Erro ao verificar status do email:', err);
        if (active) {
          setEmailStatus('error');
        }
      }
    };

    checkStatus();

    return () => {
      active = false;
    };
  }, [email]);

  useEffect(() => {
    if (emailStatus === 'confirmed') {
      toast.success('Este e-mail já foi confirmado. Faça login para continuar.');
      router.replace('/login');
    } else if (emailStatus === 'not_found') {
      toast.error('E-mail não encontrado. Verifique e tente novamente.');
      router.replace('/login');
    } else if (emailStatus === 'invalid') {
      toast.error('E-mail inválido.');
      router.replace('/login');
    } else if (emailStatus === 'error') {
      toast.error('Não foi possível validar seu e-mail. Tente novamente mais tarde.');
    }
  }, [emailStatus, router]);

  useEffect(() => {
    if (!cooldownKey || typeof window === 'undefined') return;

    const storedExpiresAt = window.localStorage.getItem(cooldownKey);
    if (!storedExpiresAt) return;

    const expiresAt = Number(storedExpiresAt);
    if (Number.isNaN(expiresAt)) {
      window.localStorage.removeItem(cooldownKey);
      return;
    }

    const remaining = Math.ceil((expiresAt - Date.now()) / 1000);
    if (remaining > 0) {
      setCooldown(remaining);
    } else {
      window.localStorage.removeItem(cooldownKey);
    }
  }, [cooldownKey]);

  useEffect(() => {
    if (!cooldownKey || typeof window === 'undefined') return;
    if (
      emailStatus === 'confirmed' ||
      emailStatus === 'not_found' ||
      emailStatus === 'invalid'
    ) {
      window.localStorage.removeItem(cooldownKey);
      setCooldown(0);
    }
  }, [cooldownKey, emailStatus]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => {
        const nextCooldown = Math.max(prev - 1, 0);
        if (nextCooldown === 0 && cooldownKey && typeof window !== 'undefined') {
          window.localStorage.removeItem(cooldownKey);
        }
        return nextCooldown;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown, cooldownKey]);

  const handleResend = async () => {
    if (!email || emailStatus !== 'unconfirmed') {
      toast.error('Email inválido');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabasebrowser.auth.resend({ type: 'signup', email });
      if (error) {
        console.error('Erro ao reenviar email:', error.message);
        toast.error('Erro ao reenviar email. Tente novamente mais tarde.');
      } else {
        toast.success('Email de verificação reenviado');
        if (cooldownKey && typeof window !== 'undefined') {
          const expiresAt = Date.now() + cooldownDuration * 1000;
          window.localStorage.setItem(cooldownKey, expiresAt.toString());
        }
        setCooldown(cooldownDuration);
      }
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled = loading || cooldown > 0 || emailStatus !== 'unconfirmed';

  const getButtonLabel = () => {
    if (loading) return 'Reenviando...';
    if (cooldown > 0) return `Reenviar em ${cooldown}s`;
    if (emailStatus === 'checking') return 'Validando e-mail...';
    if (emailStatus === 'error') return 'Erro ao validar e-mail';
    return 'Reenviar e-mail de verificação';
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#FAFAFA]">
      <div className="w-full px-4 sm:max-w-md md:max-w-lg">
        <div className="w-full bg-white rounded-lg shadow p-6 space-y-4">
          <h1 className="text-2xl font-semibold text-center">E-mail não verificado</h1>
          {email && (
            <p className="text-center text-sm">{email}</p>
          )}
          {emailStatus === 'checking' && (
            <p className="text-center text-sm text-gray-500">Validando e-mail...</p>
          )}
          {emailStatus === 'error' && (
            <p className="text-center text-sm text-red-500">
              Não foi possível validar seu e-mail agora. Tente novamente mais tarde.
            </p>
          )}
          <Button onClick={handleResend} className="w-full" disabled={isButtonDisabled}>
            {getButtonLabel()}
          </Button>
          <p className="text-center text-sm">
            <Link href="/login" className="text-teal-600 hover:underline">
              Voltar ao login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div />}>
      <VerifyEmailContent />
    </Suspense>
  );
}

