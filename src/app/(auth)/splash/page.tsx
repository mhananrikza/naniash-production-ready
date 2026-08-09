"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { NaniashCharacter } from "@/components/naniash/naniash-character";
import { siteConfig } from "@/config/site";

const SPLASH_DURATION_MS = 2400;

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.18, delayChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const } },
};

/**
 * Splash Screen — momen brand pertama yang dilihat pengguna.
 * Latar memakai gradasi "langit" tetap (tidak mengikuti light/dark
 * toggle) karena ini keputusan brand, bukan preferensi UI — sama seperti
 * splash screen aplikasi lain yang punya warna identitas tetap.
 * Auto-redirect ke /welcome setelah durasi singkat.
 */
export default function SplashPage() {
  const router = useRouter();

  React.useEffect(() => {
    router.prefetch("/welcome");
    const timer = setTimeout(() => router.replace("/welcome"), SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6"
      style={{
        background: "linear-gradient(160deg, #D98A94 0%, #E7A94C 32%, #2C2555 68%, #141230 100%)",
      }}
    >
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col items-center text-center"
      >
        <motion.div variants={item}>
          <NaniashCharacter size={128} pose="default" />
        </motion.div>

        <motion.h1
          variants={item}
          className="mt-4 font-display text-3xl font-medium tracking-tight text-[#FBF7F2]"
        >
          {siteConfig.name}
        </motion.h1>

        <motion.p variants={item} className="mt-2 text-sm text-[#F1EFFB]/80">
          {siteConfig.companion.name} — {siteConfig.companion.tagline}
        </motion.p>

        <motion.div variants={item} className="mt-10 flex items-center gap-1.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-[#F1EFFB]"
              animate={{ opacity: [0.25, 1, 0.25] }}
              transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
            />
          ))}
        </motion.div>
      </motion.div>

      <span className="sr-only" role="status">
        Memuat {siteConfig.name}…
      </span>
    </div>
  );
}
