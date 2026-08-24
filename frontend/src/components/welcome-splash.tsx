"use client";

import { motion } from 'framer-motion';
import { ShieldCheck, Compass } from 'lucide-react';
import ManMitraLogo from './manmitra-logo';

interface WelcomeSplashProps {
  userName?: string;
  subtitle?: string;
  onDismiss?: () => void;
}

export default function WelcomeSplash({ userName, subtitle, onDismiss }: WelcomeSplashProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      onClick={onDismiss}
      className="fixed inset-0 w-screen h-screen z-[999] flex flex-col items-center justify-center bg-gradient-to-br from-[#f4f8fc] via-[#e8f3fb] to-[#f0f6ff] overflow-hidden text-center px-6 cursor-pointer select-none"
    >
      {/* ── Expansive Full Screen Ambient Orbs & Particle Glows ──────────────── */}
      <motion.div
        animate={{
          scale: [1, 1.3, 0.9, 1],
          x: [-50, 60, -40, -50],
          y: [-50, -20, 60, -50],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
        className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] rounded-full bg-[#38bdf8] opacity-[0.25] blur-[160px] pointer-events-none"
      />
      
      <motion.div
        animate={{
          scale: [1, 0.85, 1.25, 1],
          x: [50, -60, 40, 50],
          y: [50, 30, -50, 50],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
        className="absolute bottom-[-10%] right-[-10%] w-[850px] h-[850px] rounded-full bg-[#2dd4bf] opacity-[0.2] blur-[170px] pointer-events-none"
      />

      <motion.div
        animate={{
          scale: [0.8, 1.25, 0.8],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#60a5fa] opacity-[0.2] blur-[140px] pointer-events-none"
      />

      {/* ── Main Full Screen Centered Content ───────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center max-w-2xl w-full pointer-events-none">
        
        {/* Animated Zen Meditation Stone Stack Logo Emblem */}
        <div className="relative mb-8">
          {/* Outer Breathing Ripples */}
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-[-20px] rounded-full bg-gradient-to-tr from-[#38bdf8]/30 via-[#2dd4bf]/30 to-[#0284c7]/30 blur-2xl"
          />

          {/* Zen Logo Floating Seamlessly */}
          <motion.div
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
            className="flex items-center justify-center filter drop-shadow-2xl"
          >
            <ManMitraLogo className="w-48 h-48 md:w-60 md:h-60" animated={true} />
          </motion.div>
        </div>

        {/* Full Screen High-Impact Brand Title */}
        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="text-6xl md:text-8xl font-black font-outfit tracking-tight mb-4"
        >
          <span className="bg-gradient-to-r from-[#0284c7] via-[#2dd4bf] to-[#0369a1] bg-clip-text text-transparent drop-shadow-sm">
            ManMitra
          </span>
        </motion.h1>

        {/* Welcome Text */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="space-y-2 mb-10"
        >
          <h3 className="text-xl md:text-2xl font-bold text-slate-800 tracking-wide">
            {userName ? `Welcome back, ${userName}!` : 'Welcome to Your Wellness Journey'}
          </h3>
          <p className="text-sm md:text-base text-slate-600 font-medium max-w-md mx-auto leading-relaxed">
            {subtitle || 'Entering your private sanctuary...'}
          </p>
        </motion.div>

        {/* Sweeping Full-Width Progress Loading Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.45 }}
          className="w-full max-w-md bg-sky-200/60 h-2.5 rounded-full overflow-hidden border border-sky-300/60 shadow-inner"
        >
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.9, ease: "easeInOut" }}
            className="h-full bg-gradient-to-r from-[#0284c7] via-[#2dd4bf] to-[#38bdf8] rounded-full shadow-lg"
          />
        </motion.div>

        {/* Security Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-2 mt-8 text-xs font-semibold text-sky-800 bg-white/90 px-5 py-2 rounded-full border border-sky-200 shadow-md backdrop-blur-md"
        >
          <Compass className="w-4 h-4 text-[#0284c7] animate-spin [animation-duration:10s]" />
          <ShieldCheck className="w-4 h-4 text-[#0284c7]" />
          <span>Sanctuary Ready</span>
        </motion.div>

      </div>
    </motion.div>
  );
}
