"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Loader2, Lock, Mail } from 'lucide-react';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [requestMode, setRequestMode] = useState(true);

  useEffect(() => {
    const t = searchParams.get('token');
    if (t) {
      setToken(t);
      setRequestMode(false);
    }
  }, [searchParams]);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('http://127.0.0.1:8000/api/auth/password/reset/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Failed to send reset link.');
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    if (password !== passwordConfirm) {
      setErrorMsg('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/api/auth/password/reset/confirm/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, password_confirm: passwordConfirm }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Password reset failed.');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification link expired or invalid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md glass-panel p-8 rounded-3xl relative z-10"
    >
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xl font-bold text-[#12b886] font-outfit mb-3">
          💚 ManMitra
        </Link>
        <h2 className="text-2xl font-bold">{requestMode ? 'Reset password' : 'Set new password'}</h2>
        <p className="text-xs text-slate-400 mt-1">
          {requestMode 
            ? 'Enter your email to receive a secure password recovery link.' 
            : 'Choose a strong, unique password for your sanctuary.'
          }
        </p>
      </div>

      {success ? (
        <div className="text-center py-6">
          <div className="w-12 h-12 rounded-full bg-[#12b886] bg-opacity-20 flex items-center justify-center mx-auto mb-4 border border-[#12b886] border-opacity-30">
            <Check className="w-6 h-6 text-[#12b886]" />
          </div>
          <h3 className="text-lg font-bold mb-2">
            {requestMode ? 'Reset link sent' : 'Password updated!'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            {requestMode 
              ? `We have emailed a recovery link to you if the address is registered.` 
              : 'Your password has been successfully updated. Redirecting to login page...'
            }
          </p>
          <Link href="/auth/login" className="glow-btn inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full text-xs font-semibold mt-6">
            Return to Login <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <form onSubmit={requestMode ? handleRequest : handleConfirm} className="space-y-4">
          {errorMsg && (
            <div className="bg-red-950 bg-opacity-30 border border-red-500 border-opacity-20 text-red-400 text-xs px-4 py-2.5 rounded-xl">
              {errorMsg}
            </div>
          )}

          {requestMode ? (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-[13px]" />
                <input
                  type="email"
                  required
                  className="w-full glass-input pl-11 pr-4 py-2.5 rounded-xl text-sm"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-[13px]" />
                  <input
                    type="password"
                    required
                    className="w-full glass-input pl-11 pr-4 py-2.5 rounded-xl text-sm"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-[13px]" />
                  <input
                    type="password"
                    required
                    className="w-full glass-input pl-11 pr-4 py-2.5 rounded-xl text-sm"
                    placeholder="••••••••"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full glow-btn py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 mt-6 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (requestMode ? 'Send Reset Link' : 'Reset Password')}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>

          <div className="text-center text-xs text-slate-400 mt-6">
            <Link href="/auth/login" className="text-[#12b886] font-medium hover:underline">
              Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#090e0c] px-4 py-12">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#12b886] opacity-[0.05] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#12b886] opacity-[0.03] blur-[130px] pointer-events-none" />

      <Suspense fallback={
        <div className="w-full max-w-md glass-panel p-8 rounded-3xl relative z-10 text-center py-12">
          <Loader2 className="w-12 h-12 text-[#12b886] animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-1">Loading password configuration...</h3>
        </div>
      }>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
