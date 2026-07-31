"use client";

import { motion } from 'framer-motion';

interface ManMitraLogoProps {
  className?: string;
  animated?: boolean;
}

export default function ManMitraLogo({ className = "w-8 h-8", animated = false }: ManMitraLogoProps) {
  if (animated) {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Top Mindfulness Dot */}
        <motion.circle
          cx="50"
          cy="20"
          r="9"
          fill="#38bdf8"
          initial={{ y: -20, opacity: 0, scale: 0 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.6, type: "spring", stiffness: 120 }}
        />

        {/* Middle Zen Balance Pebble */}
        <motion.path
          d="M32 40 C26 40, 26 50, 34 51 C46 52.5, 56 52.5, 66 51 C74 50, 74 40, 68 40 C58 40, 44 40, 32 40 Z"
          fill="#2dd4bf"
          initial={{ y: -15, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ delay: 0.45, duration: 0.6, type: "spring", stiffness: 100 }}
        />

        {/* Bottom Zen Foundation Pebble */}
        <motion.path
          d="M22 66 C15 66, 14 78, 24 81 C40 84.5, 60 84.5, 76 81 C86 78, 85 66, 78 66 C62 66, 38 66, 22 66 Z"
          fill="#0284c7"
          initial={{ y: 15, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.6, type: "spring", stiffness: 90 }}
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Top Mindfulness Dot */}
      <circle cx="50" cy="20" r="9" fill="#38bdf8" />

      {/* Middle Zen Balance Pebble */}
      <path
        d="M32 40 C26 40, 26 50, 34 51 C46 52.5, 56 52.5, 66 51 C74 50, 74 40, 68 40 C58 40, 44 40, 32 40 Z"
        fill="#2dd4bf"
      />

      {/* Bottom Zen Foundation Pebble */}
      <path
        d="M22 66 C15 66, 14 78, 24 81 C40 84.5, 60 84.5, 76 81 C86 78, 85 66, 78 66 C62 66, 38 66, 22 66 Z"
        fill="#0284c7"
      />
    </svg>
  );
}
