"use client";

import { motion, useReducedMotion } from "framer-motion";

import { Naniash } from "@/components/naniash/naniash";

const CELEBRATION_MESSAGE =
  "Masya Allah 🌷 Hari ini Bunda sudah meluangkan waktu untuk diri sendiri dan keluarga. Sampai bertemu di perjalanan berikutnya.";

/**
 * Ditampilkan begitu keempat aktivitas Daily Journey (Doa, Dzikir,
 * Afirmasi, Refleksi) selesai untuk hari ini — `isCompleted` datang
 * langsung dari `useDailyJourney` (Daily Journey Engine), bukan dihitung
 * ulang di sini.
 */
export function JourneyCompletionBanner() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative overflow-hidden rounded-[2rem] bg-gradient-langit p-6 text-nur-700 shadow-md shadow-langit-500/10 sm:p-8"
    >
      <motion.div
        className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full bg-cahaya-300/45 blur-2xl"
        aria-hidden
        animate={prefersReducedMotion ? undefined : { opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-16 -left-10 h-36 w-36 rounded-full bg-senja-300/40 blur-2xl"
        aria-hidden
        animate={prefersReducedMotion ? undefined : { opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
      />

      <div className="relative flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:gap-6 sm:text-left">
        <Naniash pose="gift" size={112} className="shrink-0" />
        <div className="space-y-1.5">
          <p className="font-display text-lg font-medium leading-snug tracking-tight text-nur-700 sm:text-xl">
            Perjalanan Hari Ini Selesai
          </p>
          <p className="max-w-md text-sm leading-relaxed text-nur-700/80">
            {CELEBRATION_MESSAGE}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
