"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { NaniashCharacter } from "@/components/naniash/naniash-character";
import { AuroraBackdrop } from "@/components/layout/aurora-backdrop";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

/**
 * Welcome — layar perkenalan setelah Splash, sebelum Onboarding.
 * Tujuannya satu: memperkenalkan Naniash & value proposition inti,
 * lalu mengarahkan ke /onboarding.
 */
export default function WelcomePage() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-6 py-12">
      <AuroraBackdrop />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex w-full max-w-sm flex-col items-center text-center"
      >
        <motion.span
          variants={item}
          className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
          {siteConfig.companion.name} · {siteConfig.companion.tagline}
        </motion.span>

        <motion.div variants={item}>
          <NaniashCharacter size={176} pose="wave" />
        </motion.div>

        <motion.h1
          variants={item}
          className="mt-6 text-balance font-display text-3xl font-medium tracking-tight text-foreground"
        >
          {siteConfig.name}
        </motion.h1>

        <motion.p variants={item} className="mt-3 text-balance text-muted-foreground">
          {siteConfig.description}
        </motion.p>

        <motion.div variants={item} className="mt-10 flex w-full flex-col gap-3">
          <Button asChild size="lg" className="w-full">
            <Link href="/onboarding">Mulai Perjalanan</Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="w-full text-muted-foreground">
            <Link href="/login">Sudah punya akun? Masuk</Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
