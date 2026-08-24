"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Shield, Sparkles, Compass, ArrowRight } from 'lucide-react';
import WelcomeSplash from '@/components/welcome-splash';
import ManMitraLogo from '@/components/manmitra-logo';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) {
      router.push('/dashboard');
    }
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2200);
    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  if (!mounted) return null;

  // Stagger animation container
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
  } as const;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-between overflow-hidden bg-[#f4f8fc]">
      
      {/* ── Full Screen Initial App Opening Splash Animation ──────────────────── */}
      <AnimatePresence>
        {showSplash && (
          <WelcomeSplash
            subtitle="Welcome to your personal mental wellness journey..."
            onDismiss={() => setShowSplash(false)}
          />
        )}
      </AnimatePresence>
      
      {/* ── Dynamic Floating Background Glows ────────────────────────────────── */}
      <motion.div 
        animate={{
          scale: [1, 1.1, 0.9, 1],
          x: [0, 40, -30, 0],
          y: [0, -30, 50, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut"
        }}
        className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#38bdf8] opacity-[0.22] blur-[140px] pointer-events-none" 
      />
      <motion.div 
        animate={{
          scale: [1, 0.85, 1.15, 1],
          x: [0, -50, 20, 0],
          y: [0, 40, -40, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut"
        }}
        className="absolute bottom-[-10%] right-[-10%] w-[550px] h-[550px] rounded-full bg-[#c084fc] opacity-[0.18] blur-[150px] pointer-events-none" 
      />

      {/* ── Premium Animated Header ─────────────────────────────────────────── */}
      <header className="w-full max-w-7xl px-8 py-6 flex items-center justify-between z-10">
        {/* Left Upper Corner: Zen Logo */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 cursor-pointer"
        >
          <ManMitraLogo className="w-12 h-12 filter drop-shadow-md hover:scale-105 transition-transform" />
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-6"
        >
          <Link href="/auth/login" className="text-sm font-semibold text-slate-600 hover:text-[#0284c7] transition-colors">
            Login
          </Link>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/auth/register" className="glow-btn px-5 py-2.5 rounded-full text-xs font-bold tracking-wide">
              Begin Journey
            </Link>
          </motion.div>
        </motion.div>
      </header>

      {/* ── Main Centered Work Area ─────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 max-w-5xl z-10 py-8">
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center"
        >
          {/* Subheader Badge */}
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-sky-200 bg-sky-50/80 text-xs font-semibold text-[#0284c7] mb-6 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" /> Your Secure Mental Wellness Journey
          </motion.div>

          {/* Main Hero Center Title: ManMitra */}
          <motion.h1
            variants={itemVariants}
            className="text-6xl md:text-8xl font-black tracking-tight font-outfit mb-3 leading-[1.05]"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0284c7] via-[#2dd4bf] to-[#0369a1] drop-shadow-sm">
              ManMitra
            </span>
          </motion.h1>

          {/* Subtitle: Your Companion Anywhere, Anytime */}
          <motion.h2
            variants={itemVariants}
            className="text-2xl md:text-3xl font-bold text-slate-800 tracking-wide mb-6"
          >
            Your Companion Anywhere, Anytime
          </motion.h2>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-base md:text-lg text-slate-600 max-w-2xl mb-10 leading-relaxed"
          >
            Connect with an empathetic companion, track emotional patterns, compile secure encrypted logs, and build customized wellness routines to balance daily stress.
          </motion.p>

          {/* Call to Action Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-5 justify-center items-center w-full max-w-md mb-20"
          >
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="w-full sm:w-auto">
              <Link href="/auth/register" className="glow-btn w-full sm:w-auto px-8 py-4 rounded-full text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-sky-200">
                Begin Free Journey <ArrowRight className="w-4 h-4 text-white" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="w-full sm:w-auto">
              <Link href="/auth/login" className="glass-panel w-full sm:w-auto px-8 py-4 rounded-full text-sm font-semibold text-slate-700 hover:border-sky-300 hover:bg-sky-50/50 transition-all flex items-center justify-center">
                Member Sign In
              </Link>
            </motion.div>
          </motion.div>

          {/* Core Value Pillars Grid - Clean Centered Layout */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl text-center"
          >
            {[
              {
                icon: <Heart className="w-7 h-7 text-[#0284c7]" />,
                title: "Empathetic Companion",
                desc: "Talk to a companion built specifically for validation, support, and guidance. Completely judgment-free."
              },
              {
                icon: <Shield className="w-7 h-7 text-[#0284c7]" />,
                title: "Encrypted Diaries",
                desc: "Your private journal is guarded with state-of-the-art security. Your reflections remain completely yours."
              },
              {
                icon: <Compass className="w-7 h-7 text-[#0284c7]" />,
                title: "Personalized Routines",
                desc: "Convert stress factors into structured routines containing guided muscle relaxation, breathing exercises, and trackers."
              }
            ].map((pillar, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -8, scale: 1.02, borderColor: "rgba(56,189,248,0.5)" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="glass-panel p-8 rounded-3xl flex flex-col items-center justify-between border border-sky-100 hover:shadow-xl hover:shadow-sky-100 transition-all group"
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    {pillar.icon}
                  </div>
                  <h3 className="text-base font-bold mb-3 text-slate-900">{pillar.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
                    {pillar.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

        </motion.div>

      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="w-full py-8 text-center text-[10px] text-slate-500 max-w-4xl px-8 border-t border-sky-100 mt-16 z-10">
        <p className="mb-2">© 2026 ManMitra. Built with care for emotional resilience and support.</p>
        <p className="max-w-2xl mx-auto leading-relaxed">
          <strong>Disclaimer:</strong> ManMitra is a personal wellness companion, not a replacement for professional diagnostic assessments, medical advice, or clinical therapies. In a crisis or emergency, please contact professional help immediately.
        </p>
      </footer>
    </div>
  );
}
