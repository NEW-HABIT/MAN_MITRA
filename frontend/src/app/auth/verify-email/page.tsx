"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setErrorMsg('No verification token provided in the URL link.');
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/auth/verify-email/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Verification failed.');
        }

        // Authenticate user instantly
        setAuth(data.user, data.tokens.access, data.tokens.refresh);
        setStatus('success');

        // Redirect to onboarding in 3 seconds
        setTimeout(() => {
          router.push('/onboarding');
        }, 3000);

      } catch (err: any) {
        setStatus('error');
        setErrorMsg(err.message || 'Verification link expired or invalid.');
      }
    };

    verify();
  }, [searchParams, router, setAuth]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md glass-panel p-8 rounded-3xl relative z-10 text-center"
    >
      <Link href="/" className="inline-flex items-center gap-1.5 text-xl font-bold text-[#12b886] font-outfit mb-8">
        💚 ManMitra
      </Link>

      {status === 'verifying' && (
        <div className="py-6">
          <Loader2 className="w-12 h-12 text-[#12b886] animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-1">Verifying your account</h3>
          <p className="text-xs text-slate-400">Authenticating details with our servers...</p>
        </div>
      )}

      {status === 'success' && (
        <div className="py-6">
          <CheckCircle2 className="w-12 h-12 text-[#12b886] mx-auto mb-4 animate-bounce" />
          <h3 className="text-lg font-bold mb-1">Sanctuary Activated!</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Your email address has been verified. Redirecting you to the onboarding planner...
          </p>
          <button
            onClick={() => router.push('/onboarding')}
            className="glow-btn inline-flex items-center gap-1.5 px-6 py-2 rounded-full text-xs font-semibold mt-6 cursor-pointer"
          >
            Go to Onboarding <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {status === 'error' && (
        <div className="py-6">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-1 text-red-400">Verification Failed</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed mb-6">
            {errorMsg}
          </p>
          <Link href="/auth/login" className="glow-btn px-6 py-2.5 rounded-full text-xs font-semibold">
            Return to Login
          </Link>
        </div>
      )}
    </motion.div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#090e0c] px-4 py-12">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#12b886] opacity-[0.05] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#12b886] opacity-[0.03] blur-[130px] pointer-events-none" />

      <Suspense fallback={
        <div className="w-full max-w-md glass-panel p-8 rounded-3xl relative z-10 text-center py-12">
          <Loader2 className="w-12 h-12 text-[#12b886] animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-1">Loading verification...</h3>
        </div>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
