'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { supabasebrowser } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Suspense } from 'react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const cooldownDuration = 60;
  const cooldownKey = email ? `verify-email-cooldown:${email}` : null;
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);

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
    if (!email) {
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

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#FAFAFA]">
      <div className="w-full px-4 sm:max-w-md md:max-w-lg">
        <div className="w-full bg-white rounded-lg shadow p-6 space-y-4">
          <h1 className="text-2xl font-semibold text-center">E-mail não verificado</h1>
          {email && (
            <p className="text-center text-sm">{email}</p>
          )}
          <Button onClick={handleResend} className="w-full" disabled={loading || cooldown > 0}>
            {loading
              ? 'Reenviando...'
              : cooldown > 0
                ? `Reenviar em ${cooldown}s`
                : 'Reenviar e-mail de verificação'}
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

