"use client";

import { motion, useReducedMotion } from "framer-motion";

import { NaniashFamily } from "@/components/naniash/naniash-family";
import { Skeleton } from "@/components/ui/skeleton";
import { JourneyActivityCard } from "@/components/daily-journey/journey-activity-card";
import { JourneyReflectionCard } from "@/components/daily-journey/journey-reflection-card";
import { JourneyCompletionBanner } from "@/components/daily-journey/journey-completion-banner";
import { useDailyJourney } from "@/hooks/use-daily-journey";
import type { DailyJourneySlot } from "@/types/daily-journey";

const RADIUS = 34;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Urutan tampil tetap: Doa → Dzikir → Afirmasi → Refleksi, sama seperti `DailyJourneyCard` di Home. */
const SLOT_ORDER: DailyJourneySlot[] = ["doa", "dzikir", "afirmasi", "artikel"];

const SLOT_META: Record<DailyJourneySlot, { icon: string; label: string }> = {
  doa: { icon: "🤲", label: "Doa" },
  dzikir: { icon: "📿", label: "Dzikir" },
  afirmasi: { icon: "✨", label: "Afirmasi" },
  artikel: { icon: "📝", label: "Refleksi" },
};

function ProgressRing({ percent }: { percent: number }) {
  const prefersReducedMotion = useReducedMotion();
  const offset = CIRCUMFERENCE - (percent / 100) * CIRCUMFERENCE;

  return (
    <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
      <svg viewBox="0 0 80 80" className="h-24 w-24 -rotate-90">
        <circle cx={40} cy={40} r={RADIUS} fill="none" strokeWidth={8} className="stroke-muted" />
        <motion.circle
          cx={40}
          cy={40}
          r={RADIUS}
          fill="none"
          strokeWidth={8}
          strokeLinecap="round"
          className="stroke-primary"
          strokeDasharray={CIRCUMFERENCE}
          initial={{ strokeDashoffset: prefersReducedMotion ? offset : CIRCUMFERENCE }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <span className="absolute font-display text-xl font-semibold text-foreground">{percent}%</span>
    </div>
  );
}

/**
 * Halaman penuh Daily Journey (`/perjalanan-harian`) — memakai Daily
 * Journey Engine yang sudah dibuat sebelumnya (`useDailyJourney`, yang di
 * baliknya memanggil `dailyJourneyService` + IndexedDB store `dailyJourney`).
 * Tidak ada engine, hook fetch, atau database baru di sini — halaman ini
 * murni menyusun ulang state yang sama menjadi ritual harian empat langkah
 * (Doa, Dzikir, Afirmasi, Refleksi), lengkap dengan aksi menandai selesai
 * dan celebration saat semuanya rampung.
 */
export function DailyJourneyPageClient() {
  const { status, day, error, setSlotComplete } = useDailyJourney();

  const doneCount = day ? SLOT_ORDER.filter((slot) => day.completion[slot]).length : 0;
  const percent = day ? Math.round((doneCount / SLOT_ORDER.length) * 100) : 0;
  const isCompleted = day?.isCompleted ?? false;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
        <NaniashFamily scene="prayer" size={72} className="shrink-0" />
        <div className="space-y-1">
          <h1 className="font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Perjalanan Hari Ini
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Sedikit demi sedikit, menjadi kebiasaan yang berarti.
          </p>
        </div>
      </div>

      {/* Progress */}
      {status === "loading" || status === "idle" ? (
        <div className="flex items-center gap-5 rounded-2xl border border-border bg-card p-5">
          <Skeleton className="h-24 w-24 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2.5">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      ) : status === "error" || !day ? (
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            {error ?? "Perjalanan hari ini belum bisa dimuat. Coba buka kembali halaman ini."}
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-5 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <ProgressRing percent={percent} />
          <div className="space-y-1">
            <p className="font-display text-base font-medium text-foreground">
              {doneCount} dari {SLOT_ORDER.length} selesai
            </p>
            <p className="text-sm text-muted-foreground">
              {isCompleted
                ? "Masya Allah, perjalanan hari ini rampung. 🌷"
                : "Yuk lanjutkan langkah kecil hari ini, Bunda."}
            </p>
          </div>
        </div>
      )}

      {/* Celebration */}
      {day && isCompleted && <JourneyCompletionBanner />}

      {/* Journey cards */}
      {day && (
        <div className="space-y-3">
          {SLOT_ORDER.map((slot) => {
            const meta = SLOT_META[slot];
            const done = day.completion[slot];

            if (slot === "artikel") {
              return (
                <JourneyReflectionCard
                  key={slot}
                  date={day.date}
                  done={done}
                  onComplete={() => setSlotComplete("artikel", true)}
                />
              );
            }

            return (
              <JourneyActivityCard
                key={slot}
                slot={slot}
                icon={meta.icon}
                label={meta.label}
                item={day.items[slot]}
                done={done}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
