"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, type PanInfo, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronLeft } from "lucide-react";

import { NaniashCharacter } from "@/components/naniash/naniash-character";
import { AuroraBackdrop } from "@/components/layout/aurora-backdrop";
import { DotIndicator } from "@/components/onboarding/dot-indicator";
import { Button } from "@/components/ui/button";
import { onboardingSlides } from "@/config/onboarding";

const SWIPE_THRESHOLD = 60;

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -80 : 80, opacity: 0 }),
};

/**
 * Onboarding — 3 slide: Selamat Datang, Pendamping Doa Harian, AI Sobat
 * Bunda. Bisa dinavigasi lewat tombol maupun swipe (drag). Setelah slide
 * terakhir, "Mulai Sekarang" masuk ke aplikasi.
 *
 * Catatan: tujuan setelah onboarding sementara diarahkan ke "/" (beranda
 * shell aplikasi) karena alur autentikasi belum dibangun — lihat roadmap
 * Phase 1 langkah 4. Ganti ke rute signup/magic-link begitu tersedia.
 */
export default function OnboardingPage() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [[index, direction], setSlide] = React.useState<[number, number]>([0, 0]);

  const isLast = index === onboardingSlides.length - 1;
  const slide = onboardingSlides[index]!;

  function goTo(nextIndex: number) {
    if (nextIndex < 0 || nextIndex >= onboardingSlides.length) return;
    setSlide([nextIndex, nextIndex > index ? 1 : -1]);
  }

  function handleNext() {
    if (isLast) {
      router.push("/");
      return;
    }
    goTo(index + 1);
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -SWIPE_THRESHOLD) {
      goTo(index + 1);
    } else if (info.offset.x > SWIPE_THRESHOLD) {
      goTo(index - 1);
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col px-6 pb-10 pt-6">
      <AuroraBackdrop />

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Kembali ke slide sebelumnya"
          onClick={() => goTo(index - 1)}
          className={index === 0 ? "invisible" : ""}
        >
          <ChevronLeft />
        </Button>

        {!isLast && (
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Lewati
          </Link>
        )}
      </div>

      <div className="flex flex-1 items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={index}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: prefersReducedMotion ? 0.15 : 0.32, ease: "easeOut" }}
            drag={prefersReducedMotion ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={handleDragEnd}
            className="flex w-full max-w-sm flex-col items-center text-center"
          >
            <NaniashCharacter size={168} pose={slide.pose} />

            <p className="mt-8 text-xs font-semibold uppercase tracking-wide text-primary">
              {slide.eyebrow}
            </p>
            <h1 className="mt-2 text-balance font-display text-2xl font-medium tracking-tight text-foreground">
              {slide.title}
            </h1>
            <p className="mt-3 text-balance text-muted-foreground">{slide.description}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex flex-col items-center gap-6">
        <DotIndicator count={onboardingSlides.length} activeIndex={index} />
        <Button size="lg" className="w-full max-w-sm" onClick={handleNext}>
          {isLast ? "Mulai Sekarang" : "Lanjut"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
