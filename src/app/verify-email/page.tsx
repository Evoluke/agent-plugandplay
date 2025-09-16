'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { supabasebrowser } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Suspense } from 'react';

const COOLDOWN_SECONDS = 60;

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const storageKey = email ? `verify-email-resend-${encodeURIComponent(email)}` : null;

  useEffect(() => {
    if (!storageKey) return;
    const storedTimestamp = localStorage.getItem(storageKey);
    if (!storedTimestamp) return;

    const parsedTimestamp = Number(storedTimestamp);
    if (!Number.isFinite(parsedTimestamp)) {
      localStorage.removeItem(storageKey);
      return;
    }

    const elapsedSeconds = Math.floor((Date.now() - parsedTimestamp) / 1000);
    const remainingSeconds = COOLDOWN_SECONDS - elapsedSeconds;

    if (remainingSeconds > 0) {
      setCooldown(remainingSeconds);
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  useEffect(() => {
    if (cooldown <= 0) {
      if (storageKey) {
        localStorage.removeItem(storageKey);
      }
      return;
    }
    const interval = setInterval(() => {
      setCooldown((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown, storageKey]);

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
        setCooldown(COOLDOWN_SECONDS);
        if (storageKey) {
          localStorage.setItem(storageKey, Date.now().toString());
        }
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

