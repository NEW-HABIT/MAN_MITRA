"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { motion } from 'framer-motion';
import { Heart, Shield, Sparkles, Compass, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) {
      router.push('/dashboard');
    }
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
    <div className="relative min-h-screen flex flex-col items-center justify-between overflow-hidden bg-[#090e0c]">
      
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
        className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#12b886] opacity-[0.07] blur-[140px] pointer-events-none" 
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
        className="absolute bottom-[-10%] right-[-10%] w-[550px] h-[550px] rounded-full bg-[#12b886] opacity-[0.05] blur-[150px] pointer-events-none" 
      />

      {/* ── Premium Animated Header ─────────────────────────────────────────── */}
      <header className="w-full max-w-7xl px-8 py-6 flex items-center justify-between z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <span className="text-2xl font-bold tracking-tight text-[#12b886] font-outfit flex items-center gap-2">
            💚 ManMitra
          </span>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-6"
        >
          <Link href="/auth/login" className="text-sm font-semibold text-slate-300 hover:text-[#12b886] transition-colors">
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
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 max-w-5xl z-10 py-12">
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center"
        >
          {/* Subheader Badge */}
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(18,184,134,0.18)] bg-[rgba(18,184,134,0.04)] text-xs font-semibold text-[#12b886] mb-8"
          >
            <Sparkles className="w-3.5 h-3.5" /> Your Secure Mental Wellness Sanctuary
          </motion.div>

          {/* Core Title */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-extrabold tracking-tight font-outfit mb-6 text-[#e6f0ed] leading-[1.1] max-w-4xl"
          >
            A Sanctuary for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#12b886] via-[#20c997] to-[#12b886] bg-[size:200%] animate-[gradient_8s_ease_infinite]">Your Mind</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-base md:text-lg text-slate-400 max-w-2xl mb-12 leading-relaxed"
          >
            Connect with an empathetic companion, track emotional patterns, compile secure encrypted logs, and build customized wellness routines to balance daily stress.
          </motion.p>

          {/* Call to Action Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-5 justify-center items-center w-full max-w-md mb-24"
          >
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="w-full sm:w-auto">
              <Link href="/auth/register" className="glow-btn w-full sm:w-auto px-8 py-4 rounded-full text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20">
                Begin Free Journey <ArrowRight className="w-4 h-4 text-black" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="w-full sm:w-auto">
              <Link href="/auth/login" className="glass-panel w-full sm:w-auto px-8 py-4 rounded-full text-sm font-semibold hover:border-[#12b886] hover:bg-[rgba(18,184,134,0.02)] transition-all flex items-center justify-center">
                Enter Sanctuary
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
                icon: <Heart className="w-7 h-7 text-[#12b886]" />,
                title: "Empathetic AI Chat",
                desc: "Talk to a companion built specifically for validation, support, and guidance. Completely judgment-free."
              },
              {
                icon: <Shield className="w-7 h-7 text-[#12b886]" />,
                title: "Encrypted Diaries",
                desc: "Your diaries are fully encrypted at rest using AES-256 keys. Private logs remain completely yours."
              },
              {
                icon: <Compass className="w-7 h-7 text-[#12b886]" />,
                title: "Personalized Routines",
                desc: "Convert stress factors into structured routines containing PMR, breathing exercises, and trackers."
              }
            ].map((pillar, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -8, scale: 1.02, borderColor: "rgba(18,184,134,0.3)" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="glass-panel p-8 rounded-3xl flex flex-col items-center justify-between border border-[rgba(18,184,134,0.06)] hover:shadow-xl hover:shadow-[#12b886]/5 transition-all group"
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-[rgba(18,184,134,0.06)] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    {pillar.icon}
                  </div>
                  <h3 className="text-base font-bold mb-3 text-[#e6f0ed]">{pillar.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                    {pillar.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

        </motion.div>

      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="w-full py-8 text-center text-[10px] text-slate-600 max-w-4xl px-8 border-t border-[rgba(18,184,134,0.05)] mt-16 z-10">
        <p className="mb-2">© 2026 ManMitra. Built with care for emotional resilience and support.</p>
        <p className="max-w-2xl mx-auto leading-relaxed">
          <strong>Disclaimer:</strong> ManMitra is an AI wellness assistant, not a replacement for professional diagnostic assessments, medical advice, or clinical therapies. In a crisis or emergency, please contact professional help immediately.
        </p>
      </footer>
    </div>
  );
}
