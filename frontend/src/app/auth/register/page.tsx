"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, ArrowRight, Check, Key, Mail, RefreshCw, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { API_URL } from '@/config';
import { useAuthStore } from '@/store/auth-store';
import ManMitraLogo from '@/components/manmitra-logo';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: '',
    password_confirm: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [devCodeNotice, setDevCodeNotice] = useState('');

  // Step 1: Request 6-digit OTP code to email
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setDevCodeNotice('');

    if (formData.password !== formData.password_confirm) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (formData.password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/send-otp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send verification code.');
      }

      if (data.dev_otp_code) {
        setDevCodeNotice(`(Testing Mode: Code generated is ${data.dev_otp_code})`);
      }

      setStep('otp');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send OTP email.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and complete registration
  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!otpCode || otpCode.trim().length < 6) {
      setErrorMsg('Please enter the full 6-digit code.');
      return;
    }

    setLoading(true);

    try {
      // 1. Verify OTP
      const verifyRes = await fetch(`${API_URL}/api/auth/verify-otp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp_code: otpCode.trim() }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.error || 'Invalid verification code.');
      }

      // 2. Register account
      const regRes = await fetch(`${API_URL}/api/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          full_name: formData.full_name,
          password: formData.password,
          password_confirm: formData.password_confirm,
          otp_code: otpCode.trim()
        }),
      });

      const regData = await regRes.json();
      if (!regRes.ok) {
        throw new Error(regData.error || 'Registration failed.');
      }

      // Store auth state if tokens returned
      if (regData.tokens) {
        setAuth(regData.user, regData.tokens.access, regData.tokens.refresh);
      }

      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#f4f8fc] px-4 py-12">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#38bdf8] opacity-[0.2] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#c084fc] opacity-[0.18] blur-[130px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass-panel p-8 rounded-3xl relative z-10 bg-white/85"
      >
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold text-[#0284c7] font-outfit mb-3">
            <ManMitraLogo className="w-7 h-7" />
            ManMitra
          </Link>
          <h2 className="text-2xl font-bold text-slate-900">
            {step === 'details' ? 'Create your sanctuary' : 'Verify your email'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {step === 'details' 
              ? 'Empathetic support is just a few steps away.' 
              : `Enter the 6-digit code sent to ${formData.email}`}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs px-4 py-2.5 rounded-xl mb-4 text-left">
            {errorMsg}
          </div>
        )}

        {devCodeNotice && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-4 py-2.5 rounded-xl mb-4 text-left font-semibold">
            {devCodeNotice}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 'details' ? (
            <motion.form
              key="details"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleRequestOTP}
              className="space-y-4 text-left"
            >
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                  placeholder="e.g. Arjun Sharma"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full glass-input pl-4 pr-11 py-2.5 rounded-xl text-sm"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    className="w-full glass-input pl-4 pr-11 py-2.5 rounded-xl text-sm"
                    placeholder="••••••••"
                    value={formData.password_confirm}
                    onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-[11px] text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                    title={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>


              <button
                type="submit"
                disabled={loading}
                className="w-full glow-btn py-3 rounded-xl text-xs font-bold tracking-wide mt-2 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" /> Sending Code...
                  </>
                ) : (
                  <>
                    Send 6-Digit Code <Mail className="w-4 h-4 text-white" />
                  </>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="otp"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onSubmit={handleVerifyAndRegister}
              className="space-y-5 text-left"
            >
              <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-100 space-y-1">
                <div className="flex items-center gap-2 text-sky-700 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-[#0284c7]" /> Email Verification Code
                </div>
                <p className="text-[11px] text-slate-600">
                  Please check your inbox at <strong className="text-slate-800">{formData.email}</strong> and enter the 6-digit code.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 text-center">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  className="w-full text-center tracking-[0.5em] text-2xl font-bold font-mono py-3 px-4 rounded-2xl border-2 border-sky-300 focus:border-[#0284c7] focus:outline-none bg-sky-50/30"
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length < 6}
                className={`w-full py-3 rounded-xl text-xs font-bold tracking-wide flex items-center justify-center gap-2 transition-all ${
                  otpCode.length === 6 && !loading
                    ? 'glow-btn cursor-pointer shadow-lg shadow-sky-200'
                    : 'bg-slate-300 text-white cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" /> Verifying Code...
                  </>
                ) : (
                  <>
                    Verify & Create Account <Check className="w-4 h-4 text-white" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="text-slate-500 hover:text-slate-800 font-semibold"
                >
                  ← Edit Details
                </button>
                <button
                  type="button"
                  onClick={(e) => handleRequestOTP(e as any)}
                  className="text-[#0284c7] hover:underline font-bold"
                >
                  Resend Code
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="mt-6 text-center text-xs text-slate-500 pt-4 border-t border-slate-100">
          Already have a sanctuary?{' '}
          <Link href="/auth/login" className="text-[#0284c7] font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
