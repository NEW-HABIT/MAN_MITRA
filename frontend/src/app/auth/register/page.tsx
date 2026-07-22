"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, Sparkles, ArrowRight, Check } from 'lucide-react';
import { API_URL } from '@/config';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: '',
    password_confirm: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${API_URL}/api/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || JSON.stringify(data.detail) || 'Registration failed.');
      }

      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
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
          <h2 className="text-2xl font-bold">Create your sanctuary</h2>
          <p className="text-xs text-slate-400 mt-1">Empathetic support is just a few steps away.</p>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-6"
          >
            <div className="w-12 h-12 rounded-full bg-[#12b886] bg-opacity-20 flex items-center justify-center mx-auto mb-4 border border-[#12b886] border-opacity-30">
              <Check className="w-6 h-6 text-[#12b886]" />
            </div>
            <h3 className="text-lg font-bold mb-2">Check your email</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              We have sent a verification link to <strong className="text-[#e6f0ed]">{formData.email}</strong>. 
              Please click the link in your inbox to activate your account.
            </p>
            <p className="text-[10px] text-slate-500 mt-4 italic">
              (Development hint: Django is printing the email to the backend terminal!)
            </p>
            <Link href="/auth/login" className="glow-btn inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full text-xs font-semibold mt-6">
              Go to Login <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="bg-red-950 bg-opacity-30 border border-red-500 border-opacity-20 text-red-400 text-xs px-4 py-2.5 rounded-xl">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
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
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
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
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <input
                type="password"
                required
                className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Confirm Password</label>
              <input
                type="password"
                required
                className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                placeholder="••••••••"
                value={formData.password_confirm}
                onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full glow-btn py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 mt-6 cursor-pointer"
            >
              {loading ? 'Creating account...' : 'Create Account'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>

            <div className="text-center text-xs text-slate-400 mt-6">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-[#12b886] font-medium hover:underline">
                Sign in
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
