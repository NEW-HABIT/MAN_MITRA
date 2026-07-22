"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, Mail, Sparkles } from 'lucide-react';
import { API_URL } from '@/config';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [unverified, setUnverified] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setUnverified(false);

    try {
      const res = await fetch(`${API_URL}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403 && data.action === 'resend_verification') {
          setUnverified(true);
        }
        throw new Error(data.error || 'Authentication failed. Please check credentials.');
      }

      // Save credentials in Zustand store
      setAuth(data.user, data.tokens.access, data.tokens.refresh);
      
      // Redirect to onboarding if profile is not filled, else dashboard
      const profile = data.user.wellness_profile;
      if (!profile || !profile.onboarding_done) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Connection failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setErrorMsg('');
    try {
      const res = await fetch(`${API_URL}/api/auth/resend-verification/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setErrorMsg('Verification link resent. Check your inbox!');
        setUnverified(false);
      }
    } catch (e) {
      setErrorMsg('Failed to resend email link.');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#090e0c] px-4 py-12">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#12b886] opacity-[0.05] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#12b886] opacity-[0.03] blur-[130px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass-panel p-8 rounded-3xl relative z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xl font-bold text-[#12b886] font-outfit mb-3">
            💚 ManMitra
          </Link>
          <h2 className="text-2xl font-bold">Welcome back</h2>
          <p className="text-xs text-slate-400 mt-1">Enter your sanctuary to reflect and chat.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className={`text-xs px-4 py-2.5 rounded-xl border ${
              errorMsg.includes('resent') 
                ? 'bg-emerald-950 bg-opacity-30 border-emerald-500 border-opacity-20 text-emerald-400' 
                : 'bg-red-950 bg-opacity-30 border-red-500 border-opacity-20 text-red-400'
            }`}>
              {errorMsg}
            </div>
          )}

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

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-400">Password</label>
              <Link href="/auth/reset-password" className="text-[11px] text-[#12b886] hover:underline">
                Forgot password?
              </Link>
            </div>
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

          {unverified && (
            <div className="text-[11px] text-amber-400 bg-amber-950 bg-opacity-20 border border-amber-500 border-opacity-10 px-4 py-2.5 rounded-xl flex items-center justify-between">
              <span>Your email is not verified.</span>
              <button type="button" onClick={handleResend} className="text-[#12b886] font-semibold hover:underline cursor-pointer">
                Resend Link
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full glow-btn py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 mt-6 cursor-pointer"
          >
            {loading ? 'Entering sanctuary...' : 'Sign In'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Google OAuth Login Simulation */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[rgba(18,184,134,0.08)]"></div></div>
          <span className="relative bg-[#0e1714] px-3 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Or continue with</span>
        </div>

        <button
          onClick={() => alert("Google Sign-In is configured on the backend! In a production deployment, this triggers Google's browser authentication modal.")}
          className="w-full glass-panel py-2.5 rounded-xl text-xs font-semibold hover:border-[#12b886] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12.24 10.285V14.4h6.887C18.2 16.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.7 0 3.3.6 4.6 1.7l3.1-3.1C17.7 1.1 15 0 12.24 0 6.13 0 1.24 4.9 1.24 11s4.9 11 11 11c5.73 0 10.96-4.1 10.96-11 0-.7-.1-1.4-.3-2.1l-9.66.385z" />
          </svg>
          Google Sanctuary Portal
        </button>

        <div className="text-center text-xs text-slate-400 mt-8">
          New to ManMitra?{' '}
          <Link href="/auth/register" className="text-[#12b886] font-medium hover:underline">
            Create an account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
