'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(token ? 'loading' : 'idle');
  const [message, setMessage] = useState<string>(token ? 'Verifying your email…' : 'No verification token found.');

  useEffect(() => {
    if (!token) return;
    let isActive = true;
    (async () => {
      try {
        const res = await fetch(`/api/users/verify-email?token=${encodeURIComponent(token)}`, {
          method: 'POST',
        });
        if (!res.ok) {
          let msg = 'Verification failed';
          try {
            const data = await res.json();
            msg = typeof data === 'string' ? data : (data?.error || msg);
          } catch {}
          throw new Error(msg);
        }
        const text = await res.json();
        if (!isActive) return;
        setStatus('success');
        setMessage(typeof text === 'string' ? text : 'Email verified successfully');
      } catch (e: any) {
        if (!isActive) return;
        setStatus('error');
        setMessage(e?.message || 'Verification failed');
      }
    })();
    return () => {
      isActive = false;
    };
  }, [token]);

  return (
    <div className="min-h-screen bg-[#111827] text-white flex items-center justify-center p-4">
      <div className="bg-gray-900/50 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-2">Verify Email</h1>
        <p className={`mb-6 text-sm ${status === 'error' ? 'text-red-400' : 'text-gray-300'}`}>{message}</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => router.replace('/sign-in')}
            className="px-4 py-2 rounded-lg bg-emerald-400 text-gray-900 font-medium hover:bg-emerald-300"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}


