"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Lock, Mail, Sparkles, Eye, EyeOff } from 'lucide-react';

import { API_URL } from '@/config';
import WelcomeSplash from '@/components/welcome-splash';
import ManMitraLogo from '@/components/manmitra-logo';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [unverified, setUnverified] = useState(false);
  
  // Splash Screen State
  const [showSplash, setShowSplash] = useState(false);
  const [userName, setUserName] = useState<string | undefined>(undefined);

  const [showPassword, setShowPassword] = useState(false);

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

      const contentType = res.headers.get('content-type');
      let data: any = {};
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      }

      if (!res.ok) {
        if (res.status === 403 && data.action === 'resend_verification') {
          setUnverified(true);
        }
        throw new Error(data.error || 'Authentication failed. Please check credentials.');
      }

      // Save credentials in Zustand store
      setAuth(data.user, data.tokens.access, data.tokens.refresh);
      setUserName(data.user.full_name);
      setShowSplash(true);

      const profile = data.user.wellness_profile;
      // Psychologists and Admins skip patient onboarding intake
      const targetPath = (data.user.role === 'user' && (!profile || !profile.onboarding_done)) 
        ? '/onboarding' 
        : '/dashboard';

      // Allow full-screen animation to play for 2.2 seconds before navigating
      setTimeout(() => {
        router.push(targetPath);
      }, 2200);

    } catch (err: any) {
      setErrorMsg(err.message || 'Connection failed.');
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
    <div className="relative min-h-screen flex items-center justify-center bg-[#f4f8fc] px-4 py-12">
      
      {/* Full Screen Login Splash Popup Animation */}
      <AnimatePresence>
        {showSplash && <WelcomeSplash userName={userName} />}
      </AnimatePresence>

      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#38bdf8] opacity-[0.2] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#c084fc] opacity-[0.18] blur-[130px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass-panel p-8 rounded-3xl relative z-10 bg-white/85"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold text-[#0284c7] font-outfit mb-3">
            <ManMitraLogo className="w-7 h-7" />
            ManMitra
          </Link>
          <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
          <p className="text-xs text-slate-500 mt-1">Enter your wellness space to reflect and chat.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className={`text-xs px-4 py-2.5 rounded-xl border ${
              errorMsg.includes('resent') 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                : 'bg-rose-50 border-rose-200 text-rose-600'
            }`}>
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-[13px]" />
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
              <label className="text-xs font-medium text-slate-600">Password</label>
              <Link href="/auth/reset-password" className="text-[11px] text-[#0284c7] font-semibold hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-[13px]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full glass-input pl-11 pr-11 py-2.5 rounded-xl text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-[11px] text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

          </div>

          {unverified && (
            <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-xl flex items-center justify-between">
              <span>Your email is not verified.</span>
              <button type="button" onClick={handleResend} className="text-[#0284c7] font-semibold hover:underline cursor-pointer">
                Resend Link
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full glow-btn py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 mt-6 cursor-pointer"
          >
            {loading ? 'Entering wellness space...' : 'Sign In'}
            {!loading && <ArrowRight className="w-4 h-4 text-white" />}
          </button>
        </form>

        {/* Google OAuth Login Simulation */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-sky-100"></div></div>
          <span className="relative bg-white px-3 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Or continue with</span>
        </div>

        <button
          onClick={() => alert("Google Sign-In will sign you in securely through your Google account.")}
          className="w-full glass-panel py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:border-sky-300 hover:bg-sky-50/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12.24 10.285V14.4h6.887C18.2 16.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.7 0 3.3.6 4.6 1.7l3.1-3.1C17.7 1.1 15 0 12.24 0 6.13 0 1.24 4.9 1.24 11s4.9 11 11 11c5.73 0 10.96-4.1 10.96-11 0-.7-.1-1.4-.3-2.1l-9.66.385z" />
          </svg>
          Google Sign-In
        </button>

        <div className="text-center text-xs text-slate-500 mt-8">
          New to ManMitra?{' '}
          <Link href="/auth/register" className="text-[#0284c7] font-semibold hover:underline">
            Create an account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
